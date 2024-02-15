import { diffDates } from "@date-time"
import * as Sentry from "@sentry/react-native"
import { Filesystem } from "./Filesystem"
import { ArrayUtils } from "./utils/Array"

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
 * A type for representing a valid name from a log file.
 */
class LogFilename {
  readonly date: Date

  private constructor (rawValue: Date) {
    this.date = rawValue
  }

  pathInDirectory (directoryPath: string) {
    return `${directoryPath}/${this.date.toISOString()}.log`
  }

  static fromCurrentDate () {
    return new LogFilename(new Date())
  }

  static fromPathString (pathString: string) {
    const pathSplits = pathString.split("/")
    const filenameSplits = pathSplits[pathSplits.length - 1].split(".")
    const fileDateString = `${filenameSplits[0]}.${filenameSplits[1]}`
    const parsedDate = new Date(fileDateString)
    if (!Number.isNaN(parsedDate.valueOf())) {
      return new LogFilename(parsedDate)
    }
    return undefined
  }
}

/**
 * A configuration for {@link RotatingFileLogs}.
 */
export type RotatingFileLogsConfig = {
  /**
   * The directory to store log files in.
   */
  directoryPath: string

  /**
   * The maximum number of files to keep in rotation.
   */
  maxFiles: number

  /**
   * The interval on which to create a new log file.
   */
  rotatingIntervalMillis: number

  /**
   * A function to format a log message.
   */
  format: (
    label: string,
    level: LogLevel,
    message: string,
    metadata?: object
  ) => string
}

/**
 * A class that writes log messages to a rotating log file system which it internally manages.
 *
 * The {@link LogHandler} on this class only queues log messages such that they can be written in
 * batch. To actually write them, call {@link flush}.
 */
export class RotatingFileLogs {
  private readonly config: RotatingFileLogsConfig
  private readonly fs: Filesystem
  private openLogFilename?: LogFilename
  private currentDateLogFilename = LogFilename.fromCurrentDate()
  private queuedLogs = [] as string[]

  constructor (config: RotatingFileLogsConfig, fs: Filesystem) {
    this.config = config
    this.fs = fs
  }

  /**
   * A log handler which queues log messages but doesn't write them to disk.
   *
   * In order to write the logs to disk, call {@link flush}.
   *
   * This log handler ignores `"debug"` level logs.
   */
  get logHandler (): LogHandler {
    // NB: We can't just return handleLog directly because then calling addLogHandler will
    // cause the "this" keyword to refer to the global "this", thus causing chaos...
    return (label, level, message, metadata) => {
      this.handleLog(label, level, message, metadata)
    }
  }

  private handleLog (
    label: string,
    level: LogLevel,
    message: string,
    metadata?: object
  ) {
    if (level === "debug") return
    this.queuedLogs.push(this.config.format(label, level, message, metadata))
  }

  /**
   * Flushes all queued log messages to disk by joining them together.
   *
   * Log messages are queued via interacting with {@link logHandler}.
   */
  async flush () {
    if (this.queuedLogs.length === 0) return
    const logFilename = await this.loadOpenLogFilename()
    await this.fs.appendString(
      logFilename.pathInDirectory(this.config.directoryPath),
      this.queuedLogs.join("")
    )
    this.queuedLogs = []
  }

  private async loadOpenLogFilename () {
    if (this.openLogFilename) return this.openLogFilename

    const persistedNames = (await this.loadPersistedLogFilenames()).sort(
      (name1, name2) => name2.date.getTime() - name1.date.getTime()
    )
    if (persistedNames.length === 0) {
      this.openLogFilename = this.currentDateLogFilename
      return this.currentDateLogFilename
    }

    const { milliseconds } = diffDates(
      this.currentDateLogFilename.date,
      persistedNames[0].date
    )

    const logsToPurge = persistedNames.slice(this.config.maxFiles - 1)
    for (const logFilename of logsToPurge) {
      await this.fs.deleteFile(
        logFilename.pathInDirectory(this.config.directoryPath)
      )
    }

    if (milliseconds < this.config.rotatingIntervalMillis) {
      this.openLogFilename = persistedNames[0]
      return persistedNames[0]
    }

    this.openLogFilename = this.currentDateLogFilename
    return this.currentDateLogFilename
  }

  private async loadPersistedLogFilenames () {
    try {
      const paths = await this.fs.listDirectoryContents(
        this.config.directoryPath
      )
      return ArrayUtils.compactMap(paths, LogFilename.fromPathString)
    } catch {
      return []
    }
  }
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
