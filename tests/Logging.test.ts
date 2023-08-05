import {
  addLogHandler,
  createLogFunction,
  resetLogHandlers,
  rotatingLogFileHandler,
  sentryBreadcrumbLogHandler
} from "@lib/Logging"
import { TestFilesystem } from "./helpers/Filesystem"
import { fakeTimers } from "./helpers/Timers"

describe("Logging tests", () => {
  fakeTimers()
  afterEach(() => resetLogHandlers())

  describe("RotatingLogFile tests", () => {
    const TEST_DIRECTORY = "test"
    const logFileName = (name: string) => {
      return `${TEST_DIRECTORY}/${name}`
    }

    const resetLogFileHandlerToDate = (date: Date) => {
      resetLogHandlers()
      addLogHandler(rotatingLogFileHandler(TEST_DIRECTORY, fs))
      jest.setSystemTime(date)
    }

    const fs = TestFilesystem.create()
    const log = createLogFunction("rotating.test")

    test("basic log", async () => {
      resetLogFileHandlerToDate(new Date("2022-11-24T00:00:03.000Z"))
      await log("info", "Test message", { a: 1, b: "hello" })

      resetLogFileHandlerToDate(new Date("2022-11-24T00:00:05.000Z"))
      await log("error", "Test message", { a: 2, b: "world", c: { d: true } })

      const logData = fs.readString(logFileName("2022-11-24T00:00:03.000Z.log"))
      expect(logData).toEqual(
        `2022-11-24T00:00:03.000Z [rotating.test] (INFO) Test message {"a":1,"b":"hello"}
2022-11-24T00:00:05.000Z [rotating.test] (ERROR) Test message {"a":2,"b":"world","c":{"d":true}}
`
      )
    })

    it("should write to the same logfile if the difference between the last log < 2 weeks", async () => {
      resetLogFileHandlerToDate(new Date("2022-11-24T00:00:03.000Z"))
      await log("info", "Test message", { a: 1, b: "hello" })

      resetLogFileHandlerToDate(new Date("2022-11-26T00:00:05.000Z"))
      await log("error", "Test message", { a: 2, b: "world", c: { d: true } })

      const logData = fs.readString(logFileName("2022-11-24T00:00:03.000Z.log"))
      expect(logData).toEqual(
        `2022-11-24T00:00:03.000Z [rotating.test] (INFO) Test message {"a":1,"b":"hello"}
2022-11-26T00:00:05.000Z [rotating.test] (ERROR) Test message {"a":2,"b":"world","c":{"d":true}}
`
      )
    })

    it("should not write DEBUG level logs to log file", async () => {
      resetLogFileHandlerToDate(new Date("2022-11-24T00:00:03.000Z"))
      await log("debug", "Test message")

      expect(
        fs.readString(logFileName("2022-11-24T00:00:03.000Z.log"))
      ).toBeUndefined()
    })

    it("should create another log file when writing to a log 2 weeks later", async () => {
      resetLogFileHandlerToDate(new Date("2022-11-24T00:00:03.000Z"))
      await log("info", "Test message 1")

      resetLogFileHandlerToDate(new Date("2022-12-09T00:00:03.000Z"))
      await log("info", "Test message 2")

      const directoryContents = await fs.listDirectory(TEST_DIRECTORY)
      expect(directoryContents).toEqual([
        "2022-11-24T00:00:03.000Z.log",
        "2022-12-09T00:00:03.000Z.log"
      ])

      const file1Logs = fs.readString(
        logFileName("2022-11-24T00:00:03.000Z.log")
      )
      const file2Logs = fs.readString(
        logFileName("2022-12-09T00:00:03.000Z.log")
      )
      expect(file1Logs).toEqual(
        "2022-11-24T00:00:03.000Z [rotating.test] (INFO) Test message 1\n"
      )
      expect(file2Logs).toEqual(
        "2022-12-09T00:00:03.000Z [rotating.test] (INFO) Test message 2\n"
      )
    })

    it("should purge the oldest log file when more than 5 log files", async () => {
      resetLogFileHandlerToDate(new Date("2023-01-01T00:00:00.000Z"))
      await log("info", "Test message 1")

      resetLogFileHandlerToDate(new Date("2023-01-15T00:00:00.000Z"))
      await log("info", "Test message 2")

      resetLogFileHandlerToDate(new Date("2023-01-29T00:00:00.000Z"))
      await log("info", "Test message 3")

      resetLogFileHandlerToDate(new Date("2023-02-12T00:00:00.000Z"))
      await log("info", "Test message 4")

      resetLogFileHandlerToDate(new Date("2023-02-26T00:00:00.000Z"))
      await log("info", "Test message 5")

      resetLogFileHandlerToDate(new Date("2023-03-12T00:00:00.000Z"))
      await log("info", "Test message 6")

      const directoryContents = await fs.listDirectory(TEST_DIRECTORY)
      expect(directoryContents).toEqual([
        "2023-01-15T00:00:00.000Z.log",
        "2023-01-29T00:00:00.000Z.log",
        "2023-02-12T00:00:00.000Z.log",
        "2023-02-26T00:00:00.000Z.log",
        "2023-03-12T00:00:00.000Z.log"
      ])

      const file1Logs = fs.readString(
        logFileName("2023-01-15T00:00:00.000Z.log")
      )
      const file2Logs = fs.readString(
        logFileName("2023-01-29T00:00:00.000Z.log")
      )
      const file3Logs = fs.readString(
        logFileName("2023-02-12T00:00:00.000Z.log")
      )
      const file4Logs = fs.readString(
        logFileName("2023-02-26T00:00:00.000Z.log")
      )
      const file5Logs = fs.readString(
        logFileName("2023-03-12T00:00:00.000Z.log")
      )
      expect(file1Logs).toEqual(
        "2023-01-15T00:00:00.000Z [rotating.test] (INFO) Test message 2\n"
      )
      expect(file2Logs).toEqual(
        "2023-01-29T00:00:00.000Z [rotating.test] (INFO) Test message 3\n"
      )
      expect(file3Logs).toEqual(
        "2023-02-12T00:00:00.000Z [rotating.test] (INFO) Test message 4\n"
      )
      expect(file4Logs).toEqual(
        "2023-02-26T00:00:00.000Z [rotating.test] (INFO) Test message 5\n"
      )
      expect(file5Logs).toEqual(
        "2023-03-12T00:00:00.000Z [rotating.test] (INFO) Test message 6\n"
      )
    })
  })

  describe("SentryBreadcrumbsLogHandler tests", () => {
    const label = "sentry.breadcrumbs.test"
    const log = createLogFunction(label)

    it("should ignore DEBUG and ERROR logs", async () => {
      const handleBreadcrumb = jest.fn()
      addLogHandler(sentryBreadcrumbLogHandler(handleBreadcrumb))

      await log("debug", "iodjkhfcids")
      await log("error", "djnsikd")

      expect(handleBreadcrumb).not.toHaveBeenCalled()
    })

    test("logging with no metadata", async () => {
      const handleBreadcrumb = jest.fn()
      addLogHandler(sentryBreadcrumbLogHandler(handleBreadcrumb))

      await log("info", "Test message")

      expect(handleBreadcrumb).toHaveBeenCalledWith({
        level: "info",
        message: "Test message",
        data: { label }
      })
    })

    test("logging with no category metadata", async () => {
      const handleBreadcrumb = jest.fn()
      addLogHandler(sentryBreadcrumbLogHandler(handleBreadcrumb))

      await log("info", "Test message", { key: "value" })

      expect(handleBreadcrumb).toHaveBeenCalledWith({
        level: "info",
        message: "Test message",
        data: { key: "value", label }
      })
    })

    test("logging with category metadata", async () => {
      const handleBreadcrumb = jest.fn()
      addLogHandler(sentryBreadcrumbLogHandler(handleBreadcrumb))

      await log("info", "Test message", {
        key: "value",
        category: "Test Category"
      })

      expect(handleBreadcrumb).toHaveBeenCalledWith({
        level: "info",
        message: "Test message",
        category: "Test Category",
        data: { key: "value", label }
      })
    })
  })
})
