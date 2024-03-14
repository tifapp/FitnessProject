import * as Sentry from "@sentry/react-native"
import { TiFSQLite } from "./SQLite"

/**
 * A level to be used when logging.
 *
 * `debug` = important stuff that doesn't matter in prod
 *
 * `info` = general log message
 *
 * `warn` = a forewarning that a giant alien spider will trample this lostbe- I mean world
 *
 * `error` = for when an error occurs
 */
export type LogLevel = "debug" | "info" | "warn" | "error"

/**
 * A type that handles log messages and sends them somewhere.
 */
export type LogHandler = (
  label: string,
  level: LogLevel,
  message: string,
  metadata?: object
) => void

const consoleLogHandler: LogHandler = (label, level, message, metadata) => {
  console[level](formatLogMessage(label, level, message, metadata))
}

let logHandlers = [consoleLogHandler]

/**
 * Creates a function to log with a given label.
 *
 * Use this instead of `console.log` to log to many different sources at once.
 *
 * ```ts
 * const log = createLogFunction("example")
 * addLogHandler(rotatingLogFileHandler(...))
 *
 * // Logs to both the console and filesystem.
 * log("info", "Message", { key: "value" })
 * ```
 *
 * By default, calling `log` will output formatted logs to the console, use `addLogHandler` to log to more sources.
 *
 * @param label the label which identifies this logger, use this in different modules of the app to identify specific components.
 * @returns a function which handles logging.
 */
export const createLogFunction = (label: string) => {
  return (level: LogLevel, message: string, metadata?: object) => {
    for (const handler of logHandlers) {
      handler(label, level, message, metadata)
    }
  }
}

/**
 * Adds a log handler that can handle and receive log messages via calls from the function created by `createLogFunction`.
 */
export const addLogHandler = (handler: LogHandler) => {
  logHandlers.push(handler)
}

/**
 * Removes all active log handlers, preserving only the console logger.
 */
export const resetLogHandlers = () => {
  logHandlers = [consoleLogHandler]
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
      level: level === "warn" ? "warning" : level,
      ...getSentryBreadcrumbMetadata(label, metadata)
    })
  }
}

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

/**
 * The default formatter for a log message.
 */
export const formatLogMessage = (
  label: string,
  level: LogLevel,
  message: string,
  metadata?: object
) => {
  const currentDate = new Date()
  const levelEmoji = emojiForLogLevel(level)
  const stringifiedMetadata = JSON.stringify(metadata)
  const metadataStr = stringifiedMetadata ? ` ${stringifiedMetadata}` : ""
  return `${currentDate.toISOString()} [${label}] (${level.toUpperCase()} ${levelEmoji}) ${message}${metadataStr}\n`
}

const emojiForLogLevel = (level: LogLevel) => {
  if (level === "debug") return "🟢"
  if (level === "info") return "🔵"
  if (level === "warn") return "🟡"
  return "🔴"
}
