import {
  SQLiteDatabase as ExpoSQLiteDatabase,
  openDatabaseAsync
} from "expo-sqlite/next"

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
  private sqlExecutablePromise: Promise<SQLExecutable>
  private queuedTransactions = [] as (() => Promise<void>)[]

  /**
   * Opens a sqlite database at the given path with all application
   * tables and migrations applied/created.
   */
  constructor(path: string) {
    this.sqlExecutablePromise = TiFSQLite.open(path)
  }

  /**
   * Runs a transaction on the database.
   *
   * All executions of transactions are serialized, so no 2 functions
   * passed to this method will interleave with each other.
   *
   * @param fn A function to run with exclusive database access.
   */
  withTransaction<T>(fn: (db: SQLExecutable) => Promise<T>) {
    const shouldRunTransactions = this.queuedTransactions.length === 0
    const promise = new Promise<T>((resolve, reject) => {
      this.queuedTransactions.push(async () => {
        try {
          const db = await this.sqlExecutablePromise
          await db._expoDb.withTransactionAsync(async () => {
            resolve(await fn(db))
          })
        } catch (e) {
          reject(e)
        }
      })
    })
    if (shouldRunTransactions) {
      this.runQueuedTransactions()
    }
    return promise
  }

  private async runQueuedTransactions() {
    while (this.queuedTransactions.length > 0) {
      const transaction = this.queuedTransactions[0]
      await transaction()
      this.queuedTransactions.shift()
    }
  }

  private static async open(path: string) {
    const db = new SQLExecutable(await openDatabaseAsync(path))
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
        CHECK(recentAnnotation IN ('attended-event', 'hosted-event')),
        PRIMARY KEY(latitude, longitude)
      )
      `
    ])
    return db
  }
}

/**
 * A class to query the database.
 *
 * This class' methods use [tagged template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
 * calling conventions which allow for queries to be string interpolated
 * whilst avoiding SQL injection.
 */
export class SQLExecutable {
  readonly _expoDb: ExpoSQLiteDatabase

  constructor(db: ExpoSQLiteDatabase) {
    this._expoDb = db
  }

  async run(statements: TemplateStringsArray, ...args: any[]) {
    const query = statements.join("?")
    const result = await this._expoDb.runAsync(query, args)
    return {
      rowsAffected: result.changes,
      lastInsertId: result.lastInsertRowId
    }
  }

  async queryFirst<T>(statements: TemplateStringsArray, ...args: any[]) {
    const query = statements.join("?")
    const result = await this._expoDb.getFirstAsync<T>(query, args)
    return result ?? undefined
  }

  async queryAll<T>(statements: TemplateStringsArray, ...args: any[]) {
    const query = statements.join("?")
    return await this._expoDb.getAllAsync<T>(query, args)
  }
}
