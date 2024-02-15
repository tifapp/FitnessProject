import {
  RotatingFileLogs,
  RotatingFileLogsConfig,
  addLogHandler,
  createLogFunction,
  formatLogMessage,
  resetLogHandlers,
  sentryBreadcrumbLogHandler,
  sentryErrorCapturingLogHandler
} from "@lib/Logging"
import { TestFilesystem } from "@test-helpers/Filesystem"
import { withAnimatedTimeTravelEnabled } from "@test-helpers/Timers"

describe("Logging tests", () => {
  withAnimatedTimeTravelEnabled()
  afterEach(() => resetLogHandlers())

  describe("RotatingFilesystemLogs tests", () => {
    const TEST_DIRECTORY = "test"
    const testLogFileName = (name: string) => {
      return `${TEST_DIRECTORY}/${name}.log`
    }

    const fs = TestFilesystem.create()
    const log = createLogFunction("rotating.filesystem.test")

    const TWO_WEEKS_MILLIS = 1000 * 60 * 60 * 24 * 14

    const TEST_LOG_FILES_CONFIG = {
      directoryPath: TEST_DIRECTORY,
      maxFiles: 5,
      rotatingIntervalMillis: TWO_WEEKS_MILLIS,
      format: formatLogMessage
    }

    const setupRotatingFileLogsWithDate = (
      date: Date,
      config: RotatingFileLogsConfig = TEST_LOG_FILES_CONFIG
    ) => {
      jest.setSystemTime(date)
      const fsLogs = new RotatingFileLogs(config, fs)
      addLogHandler(fsLogs.logHandler)
      return fsLogs
    }

    const resetToNewRotatingFileLogsWithDate = async (
      fsLogs: RotatingFileLogs,
      date: Date,
      config: RotatingFileLogsConfig = TEST_LOG_FILES_CONFIG
    ) => {
      await fsLogs.flush()
      resetLogHandlers()
      return setupRotatingFileLogsWithDate(date, config)
    }

    it("should batch write logs when flushing", async () => {
      const fsLogs = setupRotatingFileLogsWithDate(
        new Date("2022-11-24T00:00:03.000Z")
      )
      log("info", "Test message", { a: 1, b: "hello" })

      jest.setSystemTime(new Date("2022-11-24T00:00:05.000Z"))
      log("error", "Test message", { a: 2, b: "world", c: { d: true } })

      let logData = fs.readString(testLogFileName("2022-11-24T00:00:03.000Z"))
      expect(logData).toBeUndefined()

      await fsLogs.flush()

      logData = fs.readString(testLogFileName("2022-11-24T00:00:03.000Z"))
      expect(logData).toEqual(
        `2022-11-24T00:00:03.000Z [rotating.filesystem.test] (INFO 🔵) Test message {"a":1,"b":"hello"}
2022-11-24T00:00:05.000Z [rotating.filesystem.test] (ERROR 🔴) Test message {"a":2,"b":"world","c":{"d":true}}
`
      )

      jest.setSystemTime(new Date("2022-11-24T00:01:12.000Z"))
      log("error", "Test message 2")

      await fsLogs.flush()

      logData = fs.readString(testLogFileName("2022-11-24T00:00:03.000Z"))
      expect(logData).toEqual(
        `2022-11-24T00:00:03.000Z [rotating.filesystem.test] (INFO 🔵) Test message {"a":1,"b":"hello"}
2022-11-24T00:00:05.000Z [rotating.filesystem.test] (ERROR 🔴) Test message {"a":2,"b":"world","c":{"d":true}}
2022-11-24T00:01:12.000Z [rotating.filesystem.test] (ERROR 🔴) Test message 2
`
      )
    })

    it("should write to the same logfile if the difference between the last log < 2 weeks", async () => {
      let fsLogs = setupRotatingFileLogsWithDate(
        new Date("2022-11-24T00:00:03.000Z")
      )
      log("info", "Test message", { a: 1, b: "hello" })

      fsLogs = await resetToNewRotatingFileLogsWithDate(
        fsLogs,
        new Date("2022-11-26T00:00:05.000Z")
      )
      log("error", "Test message", { a: 2, b: "world", c: { d: true } })

      await fsLogs.flush()

      const logData = fs.readString(testLogFileName("2022-11-24T00:00:03.000Z"))
      expect(logData).toEqual(
        `2022-11-24T00:00:03.000Z [rotating.filesystem.test] (INFO 🔵) Test message {"a":1,"b":"hello"}
2022-11-26T00:00:05.000Z [rotating.filesystem.test] (ERROR 🔴) Test message {"a":2,"b":"world","c":{"d":true}}
`
      )
    })

    it("should not write DEBUG level logs to log file", async () => {
      const fsLogs = setupRotatingFileLogsWithDate(
        new Date("2022-11-24T00:00:03.000Z")
      )

      log("debug", "Test message")

      await fsLogs.flush()

      expect(
        fs.readString(testLogFileName("2022-11-24T00:00:03.000Z"))
      ).toBeUndefined()
    })

    it("should ignore random filenames when logging to new file", async () => {
      await fs.appendString(`${TEST_DIRECTORY}/hello.txt`, "Hello")
      let fsLogs = setupRotatingFileLogsWithDate(
        new Date("2022-11-24T00:00:03.000Z")
      )

      log("info", "test")

      fsLogs = await resetToNewRotatingFileLogsWithDate(
        fsLogs,
        new Date("2022-11-24T00:12:52.000Z")
      )
      log("info", "test 2")

      await fsLogs.flush()

      const logData = fs.readString(testLogFileName("2022-11-24T00:00:03.000Z"))
      expect(logData).toEqual(
        `2022-11-24T00:00:03.000Z [rotating.filesystem.test] (INFO 🔵) test
2022-11-24T00:12:52.000Z [rotating.filesystem.test] (INFO 🔵) test 2
`
      )
    })

    it("should create another log file when writing to a log 2 weeks later", async () => {
      let fsLogs = setupRotatingFileLogsWithDate(
        new Date("2022-11-24T00:00:03.000Z")
      )
      log("info", "Test message 1")

      fsLogs = await resetToNewRotatingFileLogsWithDate(
        fsLogs,
        new Date("2022-12-09T00:00:03.000Z")
      )
      log("info", "Test message 2")

      await fsLogs.flush()

      const directoryContents = await fs.listDirectoryContents(TEST_DIRECTORY)
      expect(directoryContents).toEqual([
        "2022-11-24T00:00:03.000Z.log",
        "2022-12-09T00:00:03.000Z.log"
      ])

      const file1Logs = fs.readString(
        testLogFileName("2022-11-24T00:00:03.000Z")
      )
      const file2Logs = fs.readString(
        testLogFileName("2022-12-09T00:00:03.000Z")
      )
      expect(file1Logs).toEqual(
        "2022-11-24T00:00:03.000Z [rotating.filesystem.test] (INFO 🔵) Test message 1\n"
      )
      expect(file2Logs).toEqual(
        "2022-12-09T00:00:03.000Z [rotating.filesystem.test] (INFO 🔵) Test message 2\n"
      )
    })

    it("should purge the oldest log file when more than 2 log files", async () => {
      const config = { ...TEST_LOG_FILES_CONFIG, maxFiles: 2 }
      let fsLogs = setupRotatingFileLogsWithDate(
        new Date("2023-01-01T00:00:00.000Z"),
        config
      )
      log("info", "Test message 1")

      fsLogs = await resetToNewRotatingFileLogsWithDate(
        fsLogs,
        new Date("2023-01-15T00:00:00.000Z"),
        config
      )
      log("info", "Test message 2")

      fsLogs = await resetToNewRotatingFileLogsWithDate(
        fsLogs,
        new Date("2023-01-29T00:00:00.000Z"),
        config
      )
      log("info", "Test message 3")

      await fsLogs.flush()

      const directoryContents = await fs.listDirectoryContents(TEST_DIRECTORY)
      expect(directoryContents).toEqual([
        "2023-01-15T00:00:00.000Z.log",
        "2023-01-29T00:00:00.000Z.log"
      ])

      const file1Logs = fs.readString(
        testLogFileName("2023-01-15T00:00:00.000Z")
      )
      const file2Logs = fs.readString(
        testLogFileName("2023-01-29T00:00:00.000Z")
      )
      expect(file1Logs).toEqual(
        "2023-01-15T00:00:00.000Z [rotating.filesystem.test] (INFO 🔵) Test message 2\n"
      )
      expect(file2Logs).toEqual(
        "2023-01-29T00:00:00.000Z [rotating.filesystem.test] (INFO 🔵) Test message 3\n"
      )
    })

    it("should trim the number of log files to the maximum when logging to a the current file", async () => {
      const config = { ...TEST_LOG_FILES_CONFIG, maxFiles: 1 }
      const fsLogs = setupRotatingFileLogsWithDate(
        new Date("2023-01-29T00:04:23.000Z"),
        config
      )
      await fs.appendString(testLogFileName("2023-01-01T00:00:00.000Z"), "logs")
      await fs.appendString(testLogFileName("2023-01-15T00:00:00.000Z"), "logs")
      await fs.appendString(testLogFileName("2023-01-29T00:00:00.000Z"), "logs")

      log("info", "wsjkadhbibhas")

      await fsLogs.flush()

      const directoryContents = await fs.listDirectoryContents(TEST_DIRECTORY)
      expect(directoryContents).toEqual(["2023-01-29T00:00:00.000Z.log"])
    })
  })

  describe("SentryBreadcrumbsLogHandler tests", () => {
    const label = "sentry.breadcrumbs.test"
    const log = createLogFunction(label)

    it("should ignore DEBUG logs", () => {
      const handleBreadcrumb = jest.fn()
      addLogHandler(sentryBreadcrumbLogHandler(handleBreadcrumb))

      log("debug", "iodjkhfcids")

      expect(handleBreadcrumb).not.toHaveBeenCalled()
    })

    test("logging with no metadata", () => {
      const handleBreadcrumb = jest.fn()
      addLogHandler(sentryBreadcrumbLogHandler(handleBreadcrumb))

      log("warn", "Test message")

      expect(handleBreadcrumb).toHaveBeenCalledWith({
        level: "warning",
        message: "Test message",
        data: { label }
      })
    })

    test("logging with no category metadata", () => {
      const handleBreadcrumb = jest.fn()
      addLogHandler(sentryBreadcrumbLogHandler(handleBreadcrumb))

      log("info", "Test message", { key: "value" })

      expect(handleBreadcrumb).toHaveBeenCalledWith({
        level: "info",
        message: "Test message",
        data: { key: "value", label }
      })
    })

    test("logging with category metadata", () => {
      const handleBreadcrumb = jest.fn()
      addLogHandler(sentryBreadcrumbLogHandler(handleBreadcrumb))

      log("error", "Test message", {
        key: "value",
        category: "Test Category"
      })

      expect(handleBreadcrumb).toHaveBeenCalledWith({
        level: "error",
        message: "Test message",
        category: "Test Category",
        data: { key: "value", label }
      })
    })
  })

  describe("SentryErrorLogHandler tests", () => {
    const log = createLogFunction("sentry.error.test")

    it("should ignore INFO and DEBUG logs", () => {
      const captureError = jest.fn()
      addLogHandler(sentryErrorCapturingLogHandler(captureError))

      log("debug", "hello", { error: new Error() })
      log("info", "hello", { error: new Error() })

      expect(captureError).not.toHaveBeenCalled()
    })

    it("should ignore logs with no error field in metadata", () => {
      const captureError = jest.fn()
      addLogHandler(sentryErrorCapturingLogHandler(captureError))

      log("error", "hello", { key: "value" })

      expect(captureError).not.toHaveBeenCalled()
    })

    it("should ignore logs with error field that's not of type Error in metadata", () => {
      const captureError = jest.fn()
      addLogHandler(sentryErrorCapturingLogHandler(captureError))

      log("error", "hello", { error: "value" })

      expect(captureError).not.toHaveBeenCalled()
    })

    it("should log the error in metadata", () => {
      const captureError = jest.fn()
      addLogHandler(sentryErrorCapturingLogHandler(captureError))

      const error = new Error("Some error")
      log("error", "hello", { error })

      expect(captureError).toHaveBeenCalledWith(error)
    })

    it("should log a custom error subclass in metadata", () => {
      class TestError extends Error {}
      const captureError = jest.fn()
      addLogHandler(sentryErrorCapturingLogHandler(captureError))

      const error = new TestError("Some error")
      log("error", "hello", { error })

      expect(captureError).toHaveBeenCalledWith(error)
    })
  })
})
