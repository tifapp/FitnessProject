import { ArrayUtils } from "./Array"
import { Filesystem } from "./Filesystem"
import { diffDates } from "./date"

export type LogLevel = "debug" | "info" | "error"

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

let logHandlers = [consoleLogHandler()] as LogHandler[]

export const createLogFunction = (label: string) => {
  return async (level: LogLevel, message: string, metadata?: object) => {
    await Promise.allSettled(
      logHandlers.map((handler) => handler(label, level, message, metadata))
    )
  }
}

export const addLogHandler = (handler: LogHandler) => {
  logHandlers.push(handler)
}

export const resetLogHandlers = () => {
  logHandlers = [consoleLogHandler()]
}

export const rotatingLogFileHandler = (
  directoryPath: string,
  fs: Filesystem
): LogHandler => {
  let writingLogFilename: LogFilename
  return async (label, level, message, metadata) => {
    if (level === "debug") return

    const logFilename =
      writingLogFilename ??
      (await LogFilename.currentInDirectory(directoryPath, fs))
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

  static async currentInDirectory (path: string, fs: Filesystem) {
    const currentLogFiles = await LogFilename.namesFromDirectory(path, fs)
    const currentDateLogfile = LogFilename.fromCurrentDate()

    if (currentLogFiles.length === 0) return currentDateLogfile
    if (diffDates(currentDateLogfile.date, currentLogFiles[0].date).weeks > 2) {
      return currentDateLogfile
    }
    return currentLogFiles[0]
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
        })
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
