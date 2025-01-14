import * as Sentry from "@sentry/react-native"
import { Migrations, SQLITE_IN_MEMORY_PATH, TiFSQLite } from "./SQLite"
import { LogHandler, LogLevel } from "TiFShared/logging"
import { ExpoTiFFileSystem } from "@modules/tif-fs"

const LOGS_DATABASE_INFO = ExpoTiFFileSystem?.logsDatabaseInfo()

export const LOGS_SQLITE_PATH = LOGS_DATABASE_INFO?.path

export const sqliteLogs = new TiFSQLite(
  LOGS_DATABASE_INFO?.databaseName ?? SQLITE_IN_MEMORY_PATH,
  Migrations.logs
)

/**
 * Compiles the logs on this device for sending in emails.
 */
export const compileLogs = async () => {
  if (!ExpoTiFFileSystem) {
    throw new Error("The native module for ExpoTiFFileSystem must exist.")
  }
  if (!LOGS_SQLITE_PATH) {
    throw new Error("Unable to find Logs Sqlite Path.")
  }
  await ExpoTiFFileSystem.zip(
    LOGS_SQLITE_PATH,
    ExpoTiFFileSystem.LOGS_ZIP_ARCHIVE_PATH
  )
  return ExpoTiFFileSystem.LOGS_ZIP_ARCHIVE_PATH
}

/**
 * A log handler which tracks info logs as sentry breadcrumbs.
 *
 * This log handler ignores `"debug"` level logs.
 */
export const sentryBreadcrumbLogHandler = (
  handleBreadcrumb: (
    breadcrumb: Sentry.Breadcrumb
  ) => void = Sentry.addBreadcrumb
): LogHandler => {
  return (label, level, message, metadata) => {
    if (level === "debug") return
    handleBreadcrumb({
      message,
      level: LOG_LEVEL_TO_SENTRY_LEVEL[level],
      ...getSentryBreadcrumbMetadata(label, metadata)
    })
  }
}

type SentryLevel = NonNullable<Sentry.Breadcrumb["level"]>

const LOG_LEVEL_TO_SENTRY_LEVEL = {
  warn: "warning",
  trace: "log",
  info: "info",
  error: "error",
  debug: "debug"
} as Record<LogLevel, SentryLevel>

const getSentryBreadcrumbMetadata = (label: string, metadata?: object) => {
  if (!metadata) return { category: undefined, data: { label } }
  const sentryData = { label, ...metadata }
  const category =
    "category" in sentryData && typeof sentryData.category === "string"
      ? sentryData.category
      : undefined

  if ("category" in sentryData && typeof sentryData.category === "string") {
    delete sentryData.category
  }
  return { category, data: sentryData }
}

/**
 * A `LogHandler` which captures errors to sentry when a log level of `"error"` is used.
 *
 * The error must be assigned to the `error` field and must be an instance of subclass of {@link Error}.
 */
export const sentryErrorCapturingLogHandler = (
  captureError: (error: Error) => void = Sentry.captureException
): LogHandler => {
  // NB: We don't need to care about the label of message since those are handled by the breadcrumb handler
  return (_, level, __, metadata) => {
    if (level !== "error" || !metadata) return
    if ("error" in metadata && metadata.error instanceof Error) {
      captureError(metadata.error)
    }
  }
}

/**
 * A {@link LogHandler} utilizing SQLite.
 *
 * @param sqlite The {@link TiFSQLite} instance to use.
 * @param logLifetimeIntervalSeconds How long in seconds each log message should last for.
 */
export const sqliteLogHandler = (
  sqlite: TiFSQLite,
  logLifetimeIntervalSeconds: number
): LogHandler => {
  return (label, level, message, metadata) => {
    sqlite.withTransaction<void>(async (db) => {
      await db.run`
      DELETE FROM Logs
      WHERE timestamp <= (unixepoch() - ${logLifetimeIntervalSeconds})
      `
      await db.run`
      INSERT INTO Logs (
        label,
        level,
        message,
        stringifiedMetadata
      ) VALUES (
        ${label},
        ${level},
        ${message},
        ${JSON.stringify(metadata)}
      )
      `
    })
  }
}

/**
 * A log message that is stored in SQLite.
 *
 * The metadata of the log message is parseable via `JSON.parse`.
 */
export type SQLiteLogMessage = {
  id: number
  label: string
  level: LogLevel
  message: string
  stringifedMetadata: string
  timestamp: number
}
