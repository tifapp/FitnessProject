import {
  SQLiteDatabase as ExpoSQLiteDatabase,
  SQLiteBindValue,
  openDatabaseAsync
} from "expo-sqlite/next"

export const SQLITE_IN_MEMORY_PATH = ":memory:"

/**
 * A class that manages the SQLite database for the app.
 *
 * The query interface is exposed in `withTransaction`, which accepts a
 * function that runs with exlusive access to the database. `withTransaction`
 * serializes execution of all transactions ensuring that no SQLite busy
 * errors, or other expo-sqlite transaction errors are thrown when attempting
 * to perform a transaction.
 */
export class TiFSQLite {
  private sqlExecutablePromise: Promise<ExpoSQLExecutable>
  private queuedTransactions = [] as (() => Promise<void>)[]

  private get isQueueEmpty() {
    return this.queuedTransactions.length === 0
  }

  /**
   * Opens a sqlite database at the given path with all application
   * tables and migrations applied/created.
   */
  constructor(
    path: string,
    openSQLExecuatble: (
      path: string
    ) => Promise<ExpoSQLExecutable> = openExpoSQLExecutable
  ) {
    this.sqlExecutablePromise = TiFSQLite.setup(path, openSQLExecuatble)
  }

  /**
   * Runs a transaction on the database.
   *
   * All executions of transactions are serialized, so no 2 functions
   * passed to this method will interleave with each other.
   *
   * Escaping the given {@link SQLExecutable} from the transaction results
   * in undefined behavior.
   *
   * @param fn A function to run with exclusive database access.
   */
  withTransaction<T>(fn: (db: SQLExecutable) => Promise<T>) {
    const shouldRunTransactions = this.isQueueEmpty
    const promise = this.enqueueTransaction(fn)
    if (shouldRunTransactions) {
      this.runQueueUntilEmpty()
    }
    return promise
  }

  private enqueueTransaction<T>(fn: (db: SQLExecutable) => Promise<T>) {
    return new Promise<T>((resolve, reject) => {
      this.queuedTransactions.push(async () => {
        try {
          const db = await this.sqlExecutablePromise
          await db.expoDb.withTransactionAsync(async () => {
            resolve(await fn(db))
          })
        } catch (e) {
          reject(e)
        }
      })
    })
  }

  private async runQueueUntilEmpty() {
    while (!this.isQueueEmpty) {
      const transaction = this.queuedTransactions[0]
      await transaction()
      this.queuedTransactions.shift()
    }
  }

  private static async setup(
    path: string,
    openSQLExecuatble: (path: string) => Promise<ExpoSQLExecutable>
  ) {
    const db = await TiFSQLite.openWithInMemoryFallback(path, openSQLExecuatble)
    await TiFSQLite.migrateV1(db)
    return db
  }

  private static async openWithInMemoryFallback(
    path: string,
    openSQLExecuatble: (path: string) => Promise<ExpoSQLExecutable>
  ) {
    try {
      return await openSQLExecuatble(path)
    } catch {
      return await openSQLExecuatble(SQLITE_IN_MEMORY_PATH)
    }
  }

  private static async migrateV1(db: SQLExecutable) {
    await Promise.all([
      db.run`
      CREATE TABLE IF NOT EXISTS LocationArrivals (
        latitude DOUBLE,
        longitude DOUBLE,
        arrivalRadiusMeters DOUBLE,
        hasArrived INT2 DEFAULT 0,
        PRIMARY KEY(latitude, longitude, arrivalRadiusMeters)
      )
      `,
      db.run`
      CREATE TABLE IF NOT EXISTS UpcomingEventArrivals (
        eventId BIGINT,
        latitude DOUBLE,
        longitude DOUBLE,
        arrivalRadiusMeters DOUBLE,
        PRIMARY KEY(eventId, latitude, longitude, arrivalRadiusMeters),
        FOREIGN KEY(latitude, longitude, arrivalRadiusMeters)
          REFERENCES LocationArrivals(latitude, longitude, arrivalRadiusMeters)
          ON DELETE CASCADE
      )
      `,
      db.run`
      CREATE TABLE IF NOT EXISTS LocationPlacemarks (
        latitude DOUBLE NOT NULL,
        longitude DOUBLE NOT NULL,
        name TEXT,
        country TEXT,
        postalCode TEXT,
        street TEXT,
        streetNumber TEXT,
        region TEXT,
        isoCountryCode TEXT,
        city TEXT,
        recentAnnotation TEXT,
        recentUpdatedAt DOUBLE NOT NULL DEFAULT (unixepoch('now', 'subsec')),
        CHECK(
          recentAnnotation IN (
            'attended-event',
            'hosted-event',
            'joined-event'
          )
        ),
        PRIMARY KEY(latitude, longitude)
      )
      `,
      db.run`
      CREATE TABLE IF NOT EXISTS Logs (
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        label TEXT NOT NULL,
        message TEXT NOT NULL,
        level TEXT NOT NULL CHECK(level IN ('debug', 'info', 'warn', 'error')),
        stringifiedMetadata TEXT,
        timestamp DOUBLE NOT NULL DEFAULT (unixepoch('now', 'subsec'))
      )
      `,
      db.run`
      CREATE TABLE IF NOT EXISTS InternalMetrics (
        id TEXT NOT NULL PRIMARY KEY DEFAULT 'A' CHECK (id = 'A'),
        hasCompletedOnboarding INT2 NOT NULL,
        lastEventArrivalsRefreshTime DOUBLE
      )
      `,
      db.run`
      CREATE TABLE IF NOT EXISTS DeviceSettings (
        id TEXT NOT NULL PRIMARY KEY DEFAULT 'A' CHECK (id = 'A'),
        isHapticFeedbackEnabled INT2 NOT NULL,
        isHapticAudioEnabled INT2 NOT NULL
      )
      `
    ])
  }
}

/**
 * A type exposing methods to query the database.
 *
 * This class' methods use [tagged template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
 * calling conventions which allow for queries to be string interpolated
 * whilst avoiding SQL injection.
 */
export type SQLExecutable = Omit<ExpoSQLExecutable, "expoDb">

export const openExpoSQLExecutable = async (path: string) => {
  return new ExpoSQLExecutable(await openDatabaseAsync(path))
}

/**
 * A value that can be placed in the template string in {@link SQLExecutable}.
 */
export type SQLiteInterpolatableValue = SQLiteBindValue | undefined

/**
 * An expo backed {@link SQLExecutable}.
 */
export class ExpoSQLExecutable implements SQLExecutable {
  readonly expoDb: ExpoSQLiteDatabase

  constructor(db: ExpoSQLiteDatabase) {
    this.expoDb = db
  }

  /**
   * Runs the given sql query using template syntax, and returns the last
   * insertion id and the number of rows that the query update, inserted
   * or removed.
   *
   * This method should be used for "UPDATE", "DELETE", and "INSERT"
   * statements.
   */
  async run(
    statements: TemplateStringsArray,
    ...args: SQLiteInterpolatableValue[]
  ) {
    const { query, values } = this.queryParameters(statements, args)
    const result = await this.expoDb.runAsync(query, values)
    return {
      rowsAffected: result.changes,
      lastInsertId: result.lastInsertRowId
    }
  }

  /**
   * Returns the first result from the given query using template syntax.
   *
   * This method should be used for "SELECT" queries where only 1 result is
   * needed.
   */
  async queryFirst<T>(
    statements: TemplateStringsArray,
    ...args: SQLiteInterpolatableValue[]
  ) {
    const { query, values } = this.queryParameters(statements, args)
    const result = await this.expoDb.getFirstAsync<T>(query, values)
    return result ?? undefined
  }

  /**
   * Returns all the results from the given query using template syntax.
   *
   * This method should be used for "SELECT" queries which return a list of
   * results.
   */
  async queryAll<T>(
    statements: TemplateStringsArray,
    ...args: SQLiteInterpolatableValue[]
  ) {
    const { query, values } = this.queryParameters(statements, args)
    return await this.expoDb.getAllAsync<T>(query, values)
  }

  private queryParameters(
    statements: TemplateStringsArray,
    args: SQLiteInterpolatableValue[]
  ) {
    return {
      query: statements.join("?"),
      values: args.map((arg) => {
        if (typeof arg === "boolean") {
          return arg ? 1 : 0
        }
        return arg === undefined ? null : arg
      })
    }
  }
}
