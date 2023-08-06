import {
  RotatingFilesystemLogs,
  addLogHandler,
  createLogFunction,
  resetLogHandlers,
  sentryBreadcrumbLogHandler,
  sentryErrorCapturingLogHandler
} from "@lib/Logging"
import { TestFilesystem } from "./helpers/Filesystem"
import { fakeTimers } from "./helpers/Timers"

describe("Logging tests", () => {
  fakeTimers()
  afterEach(() => resetLogHandlers())

  describe("RotatingFilesystemLogs tests", () => {
    const TEST_DIRECTORY = "test"
    const testLogFileName = (name: string) => {
      return `${TEST_DIRECTORY}/${name}`
    }

    const fs = TestFilesystem.create()
    const log = createLogFunction("rotating.filesystem.test")

    const setupRotatingFilesystemLogsWithDate = (date: Date) => {
      jest.setSystemTime(date)
      const fsLogs = new RotatingFilesystemLogs(TEST_DIRECTORY, fs)
      addLogHandler(fsLogs.logHandler)
      return fsLogs
    }

    const resetToNewRotatingLogFilesystemWithDate = async (
      fsLogs: RotatingFilesystemLogs,
      date: Date
    ) => {
      await fsLogs.flush()
      resetLogHandlers()
      return setupRotatingFilesystemLogsWithDate(date)
    }

    it("should batch write logs when flushing", async () => {
      const fsLogs = setupRotatingFilesystemLogsWithDate(
        new Date("2022-11-24T00:00:03.000Z")
      )
      log("info", "Test message", { a: 1, b: "hello" })

      jest.setSystemTime(new Date("2022-11-24T00:00:05.000Z"))
      log("error", "Test message", { a: 2, b: "world", c: { d: true } })

      let logData = fs.readString(
        testLogFileName("2022-11-24T00:00:03.000Z.log")
      )
      expect(logData).toBeUndefined()

      await fsLogs.flush()

      logData = fs.readString(testLogFileName("2022-11-24T00:00:03.000Z.log"))
      expect(logData).toEqual(
        `2022-11-24T00:00:03.000Z [rotating.filesystem.test] (INFO 🔵) Test message {"a":1,"b":"hello"}
2022-11-24T00:00:05.000Z [rotating.filesystem.test] (ERROR 🔴) Test message {"a":2,"b":"world","c":{"d":true}}
`
      )

      jest.setSystemTime(new Date("2022-11-24T00:01:12.000Z"))
      log("error", "Test message 2")

      await fsLogs.flush()

      logData = fs.readString(testLogFileName("2022-11-24T00:00:03.000Z.log"))
      expect(logData).toEqual(
        `2022-11-24T00:00:03.000Z [rotating.filesystem.test] (INFO 🔵) Test message {"a":1,"b":"hello"}
2022-11-24T00:00:05.000Z [rotating.filesystem.test] (ERROR 🔴) Test message {"a":2,"b":"world","c":{"d":true}}
2022-11-24T00:01:12.000Z [rotating.filesystem.test] (ERROR 🔴) Test message 2
`
      )
    })

    it("should write to the same logfile if the difference between the last log < 2 weeks", async () => {
      let fsLogs = setupRotatingFilesystemLogsWithDate(
        new Date("2022-11-24T00:00:03.000Z")
      )
      log("info", "Test message", { a: 1, b: "hello" })

      fsLogs = await resetToNewRotatingLogFilesystemWithDate(
        fsLogs,
        new Date("2022-11-26T00:00:05.000Z")
      )
      log("error", "Test message", { a: 2, b: "world", c: { d: true } })

      await fsLogs.flush()

      const logData = fs.readString(
        testLogFileName("2022-11-24T00:00:03.000Z.log")
      )
      expect(logData).toEqual(
        `2022-11-24T00:00:03.000Z [rotating.filesystem.test] (INFO 🔵) Test message {"a":1,"b":"hello"}
2022-11-26T00:00:05.000Z [rotating.filesystem.test] (ERROR 🔴) Test message {"a":2,"b":"world","c":{"d":true}}
`
      )
    })

    it("should not write DEBUG level logs to log file", async () => {
      const fsLogs = setupRotatingFilesystemLogsWithDate(
        new Date("2022-11-24T00:00:03.000Z")
      )

      log("debug", "Test message")

      await fsLogs.flush()

      expect(
        fs.readString(testLogFileName("2022-11-24T00:00:03.000Z.log"))
      ).toBeUndefined()
    })

    it("should ignore random filenames when logging to new file", async () => {
      await fs.appendString(`${TEST_DIRECTORY}/hello.txt`, "Hello")
      let fsLogs = setupRotatingFilesystemLogsWithDate(
        new Date("2022-11-24T00:00:03.000Z")
      )

      log("info", "test")

      fsLogs = await resetToNewRotatingLogFilesystemWithDate(
        fsLogs,
        new Date("2022-11-24T00:12:52.000Z")
      )
      log("info", "test 2")

      await fsLogs.flush()

      const logData = fs.readString(
        testLogFileName("2022-11-24T00:00:03.000Z.log")
      )
      expect(logData).toEqual(
        `2022-11-24T00:00:03.000Z [rotating.filesystem.test] (INFO 🔵) test
2022-11-24T00:12:52.000Z [rotating.filesystem.test] (INFO 🔵) test 2
`
      )
    })

    it("should create another log file when writing to a log 2 weeks later", async () => {
      let fsLogs = setupRotatingFilesystemLogsWithDate(
        new Date("2022-11-24T00:00:03.000Z")
      )
      log("info", "Test message 1")

      fsLogs = await resetToNewRotatingLogFilesystemWithDate(
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
        testLogFileName("2022-11-24T00:00:03.000Z.log")
      )
      const file2Logs = fs.readString(
        testLogFileName("2022-12-09T00:00:03.000Z.log")
      )
      expect(file1Logs).toEqual(
        "2022-11-24T00:00:03.000Z [rotating.filesystem.test] (INFO 🔵) Test message 1\n"
      )
      expect(file2Logs).toEqual(
        "2022-12-09T00:00:03.000Z [rotating.filesystem.test] (INFO 🔵) Test message 2\n"
      )
    })

    it("should purge the oldest log file when more than 5 log files", async () => {
      let fsLogs = setupRotatingFilesystemLogsWithDate(
        new Date("2023-01-01T00:00:00.000Z")
      )
      log("info", "Test message 1")

      fsLogs = await resetToNewRotatingLogFilesystemWithDate(
        fsLogs,
        new Date("2023-01-15T00:00:00.000Z")
      )
      log("info", "Test message 2")

      fsLogs = await resetToNewRotatingLogFilesystemWithDate(
        fsLogs,
        new Date("2023-01-29T00:00:00.000Z")
      )
      log("info", "Test message 3")

      fsLogs = await resetToNewRotatingLogFilesystemWithDate(
        fsLogs,
        new Date("2023-02-12T00:00:00.000Z")
      )
      log("info", "Test message 4")

      fsLogs = await resetToNewRotatingLogFilesystemWithDate(
        fsLogs,
        new Date("2023-02-26T00:00:00.000Z")
      )
      log("info", "Test message 5")

      fsLogs = await resetToNewRotatingLogFilesystemWithDate(
        fsLogs,
        new Date("2023-03-12T00:00:00.000Z")
      )
      log("info", "Test message 6")

      await fsLogs.flush()

      const directoryContents = await fs.listDirectoryContents(TEST_DIRECTORY)
      expect(directoryContents).toEqual([
        "2023-01-15T00:00:00.000Z.log",
        "2023-01-29T00:00:00.000Z.log",
        "2023-02-12T00:00:00.000Z.log",
        "2023-02-26T00:00:00.000Z.log",
        "2023-03-12T00:00:00.000Z.log"
      ])

      const file1Logs = fs.readString(
        testLogFileName("2023-01-15T00:00:00.000Z.log")
      )
      const file2Logs = fs.readString(
        testLogFileName("2023-01-29T00:00:00.000Z.log")
      )
      const file3Logs = fs.readString(
        testLogFileName("2023-02-12T00:00:00.000Z.log")
      )
      const file4Logs = fs.readString(
        testLogFileName("2023-02-26T00:00:00.000Z.log")
      )
      const file5Logs = fs.readString(
        testLogFileName("2023-03-12T00:00:00.000Z.log")
      )
      expect(file1Logs).toEqual(
        "2023-01-15T00:00:00.000Z [rotating.filesystem.test] (INFO 🔵) Test message 2\n"
      )
      expect(file2Logs).toEqual(
        "2023-01-29T00:00:00.000Z [rotating.filesystem.test] (INFO 🔵) Test message 3\n"
      )
      expect(file3Logs).toEqual(
        "2023-02-12T00:00:00.000Z [rotating.filesystem.test] (INFO 🔵) Test message 4\n"
      )
      expect(file4Logs).toEqual(
        "2023-02-26T00:00:00.000Z [rotating.filesystem.test] (INFO 🔵) Test message 5\n"
      )
      expect(file5Logs).toEqual(
        "2023-03-12T00:00:00.000Z [rotating.filesystem.test] (INFO 🔵) Test message 6\n"
      )
    })
  })

  describe("SentryBreadcrumbsLogHandler tests", () => {
    const label = "sentry.breadcrumbs.test"
    const log = createLogFunction(label)

    it("should ignore DEBUG logs", async () => {
      const handleBreadcrumb = jest.fn()
      addLogHandler(sentryBreadcrumbLogHandler(handleBreadcrumb))

      log("debug", "iodjkhfcids")

      expect(handleBreadcrumb).not.toHaveBeenCalled()
    })

    test("logging with no metadata", async () => {
      const handleBreadcrumb = jest.fn()
      addLogHandler(sentryBreadcrumbLogHandler(handleBreadcrumb))

      log("info", "Test message")

      expect(handleBreadcrumb).toHaveBeenCalledWith({
        level: "info",
        message: "Test message",
        data: { label }
      })
    })

    test("logging with no category metadata", async () => {
      const handleBreadcrumb = jest.fn()
      addLogHandler(sentryBreadcrumbLogHandler(handleBreadcrumb))

      log("info", "Test message", { key: "value" })

      expect(handleBreadcrumb).toHaveBeenCalledWith({
        level: "info",
        message: "Test message",
        data: { key: "value", label }
      })
    })

    test("logging with category metadata", async () => {
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

    it("should ignore INFO and DEBUG logs", async () => {
      const captureError = jest.fn()
      addLogHandler(sentryErrorCapturingLogHandler(captureError))

      log("debug", "hello", { error: new Error() })
      log("info", "hello", { error: new Error() })

      expect(captureError).not.toHaveBeenCalled()
    })

    it("should ignore logs with no error field in metadata", async () => {
      const captureError = jest.fn()
      addLogHandler(sentryErrorCapturingLogHandler(captureError))

      log("error", "hello", { key: "value" })

      expect(captureError).not.toHaveBeenCalled()
    })

    it("should ignore logs with error field that's not of type Error in metadata", async () => {
      const captureError = jest.fn()
      addLogHandler(sentryErrorCapturingLogHandler(captureError))

      log("error", "hello", { error: "value" })

      expect(captureError).not.toHaveBeenCalled()
    })

    it("should log the error in metadata", async () => {
      const captureError = jest.fn()
      addLogHandler(sentryErrorCapturingLogHandler(captureError))

      const error = new Error("Some error")
      log("error", "hello", { error })

      expect(captureError).toHaveBeenCalledWith(error)
    })
  })
})
