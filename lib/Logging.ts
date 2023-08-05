import { ArrayUtils } from "./Array"
import { Filesystem } from "./Filesystem"
import { diffDates } from "./date"
import { Native as SentryNative } from "sentry-expo"

/**
 * A level to be used when logging.
 *
 * `debug` = important stuff that doesn't matter in prod
 * `info` = general log message
 * `error` = for when an error occurs
 */
export type LogLevel = "debug" | "info" | "error"

/**
 * A type that handles log messages and sends them somewhere.
 */
export type LogHandler = (
  label: string,
  level: LogLevel,
  message: string,
  metadata?: object
) => Promise<void>

const consoleLogHandler = (): LogHandler => {
  return async (label, level, message, metadata) => {
    console[level](formatLogMessage(label, level, message, metadata))
  }
}

let logHandlers = [consoleLogHandler()]

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
  return async (level: LogLevel, message: string, metadata?: object) => {
    await Promise.allSettled(
      logHandlers.map((handler) => handler(label, level, message, metadata))
    )
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
  logHandlers = [consoleLogHandler()]
}

/**
 * A `LogHandler` which logs to a rotating log file system.
 *
 * @param directoryPath the base logs directory.
 * @param fs the {@link Filesystem} interface to use.
 */
export const rotatingLogFileHandler = (
  directoryPath: string,
  fs: Filesystem
): LogHandler => {
  let writingLogFilename: LogFilename
  return async (label, level, message, metadata) => {
    if (level === "debug") return

    const logFilename =
      writingLogFilename ??
      (await LogFilename.getCurrentWritable(directoryPath, fs))
    writingLogFilename = logFilename
    await fs.appendString(
      logFilename.pathInDirectory(directoryPath),
      formatLogMessage(label, level, message, metadata)
    )
  }
}

class LogFilename {
  private readonly date: Date

  private constructor (rawValue: Date) {
    this.date = rawValue
  }

  pathInDirectory (directoryPath: string): string {
    return `${directoryPath}/${this.date.toISOString()}.log`
  }

  static async getCurrentWritable (path: string, fs: Filesystem) {
    const persistedNames = await LogFilename.namesFromDirectory(path, fs)
    const currentDateName = LogFilename.fromCurrentDate()
    if (persistedNames.length === 0) return currentDateName

    const weeksDiff = diffDates(
      currentDateName.date,
      persistedNames[0].date
    ).weeks

    if (weeksDiff < 2) {
      return persistedNames[0]
    }

    if (persistedNames.length >= 5) {
      const deletePath =
        persistedNames[persistedNames.length - 1].pathInDirectory(path)
      await fs.deleteFile(deletePath)
    }

    return currentDateName
  }

  private static async namesFromDirectory (
    directoryPath: string,
    fs: Filesystem
  ): Promise<LogFilename[]> {
    return await fs
      .listDirectory(directoryPath)
      .then((contents) =>
        ArrayUtils.compactMap(contents, (content) => {
          return LogFilename.fromPathString(content)
        }).sort((name1, name2) => name2.date.getTime() - name1.date.getTime())
      )
      .catch(() => [])
  }

  private static fromCurrentDate () {
    return new LogFilename(new Date())
  }

  private static fromPathString (pathString: string) {
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
 * A log handler which tracks info logs as sentry breadcrumbs.
 */
export const sentryBreadcrumbLogHandler = (
  handleBreadcrumb: (
    breadcrumb: SentryNative.Breadcrumb
  ) => void = SentryNative.addBreadcrumb
): LogHandler => {
  return async (label, level, message, metadata) => {
    if (level !== "info") return
    handleBreadcrumb({ message, level, ...getSentryMetadata(label, metadata) })
  }
}

const getSentryMetadata = (label: string, metadata?: object) => {
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

const formatLogMessage = (
  label: string,
  level: LogLevel,
  message: string,
  metadata?: object
) => {
  const currentDate = new Date()
  const stringifiedMetadata = JSON.stringify(metadata)
  return `${currentDate.toISOString()} [${label}] (${level.toUpperCase()}) ${message}${
    stringifiedMetadata ? " " + stringifiedMetadata : ""
  }\n`
}
