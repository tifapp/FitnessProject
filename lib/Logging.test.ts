import {
  SQLiteLogMessage,
  sentryBreadcrumbLogHandler,
  sentryErrorCapturingLogHandler,
  sqliteLogHandler
} from "@lib/Logging"
import { resetTestSQLiteBeforeEach, testSQLite } from "@test-helpers/SQLite"
import { fakeTimers } from "@test-helpers/Timers"
import { waitFor } from "@testing-library/react-native"
import { dayjs } from "TiFShared/lib/Dayjs"
import { addLogHandler, logger, resetLogHandlers } from "TiFShared/logging"

describe("Logging tests", () => {
  fakeTimers()
  afterEach(() => resetLogHandlers())

  describe("SQLiteLogHandler tests", () => {
    resetTestSQLiteBeforeEach()
    const label = "sqlite.log.handler.test"
    const log = logger(label)

    beforeEach(() => {
      addLogHandler(
        sqliteLogHandler(testSQLite, dayjs.duration(2, "w").asSeconds())
      )
    })

    it("should store log messages in sqlite", async () => {
      const metadata = { hello: "world", num: 1 }
      log.debug("Debug message")
      log.info("Info message")
      log.warn("Warning message")
      log.error("Error message")
      log.info("With metadata", metadata)

      await waitFor(async () => {
        expect(await allLogs()).toEqual([
          expect.objectContaining({
            id: 1,
            label,
            level: "debug",
            message: "Debug message",
            stringifiedMetadata: null
          }),
          expect.objectContaining({
            id: 2,
            label,
            level: "info",
            message: "Info message",
            stringifiedMetadata: null
          }),
          expect.objectContaining({
            id: 3,
            label,
            level: "warn",
            message: "Warning message",
            stringifiedMetadata: null
          }),
          expect.objectContaining({
            id: 4,
            label,
            level: "error",
            message: "Error message",
            stringifiedMetadata: null
          }),
          expect.objectContaining({
            id: 5,
            label,
            level: "info",
            message: "With metadata",
            stringifiedMetadata: JSON.stringify(metadata)
          })
        ])
      })
    })

    it("should purge any logs that are older than the test time threshold", async () => {
      await testSQLite.withTransaction(async (db) => {
        await db.run`
        INSERT INTO Logs (
          label,
          level,
          message,
          stringifiedMetadata,
          timestamp
        ) VALUES (
          'test.old.message',
          'debug',
          'A test really old log message',
          NULL,
          0
        )
        `
      })
      log.info("Test")
      await waitFor(async () => {
        const logs = await allLogs()
        expect(logs).toHaveLength(1)
        expect(logs[0].level).toEqual("info")
        expect(logs[0].timestamp).toBeGreaterThan(0)
      })
    })

    const allLogs = async () => {
      return await testSQLite.withTransaction(async (db) => {
        return await db.queryAll<SQLiteLogMessage>`SELECT * FROM Logs`
      })
    }
  })

  describe("SentryBreadcrumbsLogHandler tests", () => {
    const label = "sentry.breadcrumbs.test"
    const log = logger(label)

    it("should ignore DEBUG logs", () => {
      const handleBreadcrumb = jest.fn()
      addLogHandler(sentryBreadcrumbLogHandler(handleBreadcrumb))

      log.debug("iodjkhfcids")

      expect(handleBreadcrumb).not.toHaveBeenCalled()
    })

    it("should use the log serverity level when level is trace", () => {
      const handleBreadcrumb = jest.fn()
      addLogHandler(sentryBreadcrumbLogHandler(handleBreadcrumb))

      log.trace("Trace")

      expect(handleBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "log"
        })
      )
    })

    test("logging with no metadata", () => {
      const handleBreadcrumb = jest.fn()
      addLogHandler(sentryBreadcrumbLogHandler(handleBreadcrumb))

      log.warn("Test message")

      expect(handleBreadcrumb).toHaveBeenCalledWith({
        level: "warning",
        message: "Test message",
        data: { label }
      })
    })

    test("logging with no category metadata", () => {
      const handleBreadcrumb = jest.fn()
      addLogHandler(sentryBreadcrumbLogHandler(handleBreadcrumb))

      log.info("Test message", { key: "value" })

      expect(handleBreadcrumb).toHaveBeenCalledWith({
        level: "info",
        message: "Test message",
        data: { key: "value", label }
      })
    })

    test("logging with category metadata", () => {
      const handleBreadcrumb = jest.fn()
      addLogHandler(sentryBreadcrumbLogHandler(handleBreadcrumb))

      log.error("Test message", {
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
    const log = logger("sentry.error.test")

    it("should ignore INFO and DEBUG logs", () => {
      const captureError = jest.fn()
      addLogHandler(sentryErrorCapturingLogHandler(captureError))

      log.debug("hello", { error: new Error() })
      log.info("hello", { error: new Error() })

      expect(captureError).not.toHaveBeenCalled()
    })

    it("should ignore logs with no error field in metadata", () => {
      const captureError = jest.fn()
      addLogHandler(sentryErrorCapturingLogHandler(captureError))

      log.error("hello", { key: "value" })

      expect(captureError).not.toHaveBeenCalled()
    })

    it("should ignore logs with error field that's not of type Error in metadata", () => {
      const captureError = jest.fn()
      addLogHandler(sentryErrorCapturingLogHandler(captureError))

      log.error("hello", { error: "value" })

      expect(captureError).not.toHaveBeenCalled()
    })

    it("should log the error in metadata", () => {
      const captureError = jest.fn()
      addLogHandler(sentryErrorCapturingLogHandler(captureError))

      const error = new Error("Some error")
      log.error("hello", { error })

      expect(captureError).toHaveBeenCalledWith(error)
    })

    it("should log a custom error subclass in metadata", () => {
      class TestError extends Error {}
      const captureError = jest.fn()
      addLogHandler(sentryErrorCapturingLogHandler(captureError))

      const error = new TestError("Some error")
      log.error("hello", { error })

      expect(captureError).toHaveBeenCalledWith(error)
    })
  })
})
