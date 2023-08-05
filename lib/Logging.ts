import { Filesystem } from "./Filesystem"

export type LogLevel = "debug" | "info" | "error"

export type LogHandler = (
  label: string,
  level: LogLevel,
  message: string,
  metadata?: object
) => Promise<void>

let logHandlers = [] as LogHandler[]

export const createLogFunction = (label: string) => {
  return (level: LogLevel, message: string, metadata?: object) => {
    for (const handler of logHandlers) {
      handler(label, level, message, metadata)
    }
  }
}

export const addLogHandler = (handler: LogHandler) => {
  logHandlers.push(handler)
}

export const resetLogHandlers = () => {
  logHandlers = []
}

export const rotatingLogFileHandler = (
  directoryPath: string,
  fs: Filesystem
): LogHandler => {
  const currentDate = new Date()
  const logFilename = logFileNameForDate(directoryPath, currentDate)

  return async (label, level, message, metadata) => {
    const currentDate = new Date()
    const stringifiedMetadata = JSON.stringify(metadata)
    await fs.appendString(
      logFilename,
      `${currentDate.toISOString()} [${label}] (${level.toUpperCase()}) ${message}${
        stringifiedMetadata ? " " + stringifiedMetadata : ""
      }\n`
    )
  }
}

const logFileNameForDate = (directoryPath: string, date: Date) => {
  return `${directoryPath}/${date.toISOString()}.log`
}
