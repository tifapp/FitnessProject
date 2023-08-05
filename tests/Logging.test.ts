import {
  addLogHandler,
  createLogFunction,
  resetLogHandlers,
  rotatingLogFileHandler
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

    const fs = TestFilesystem.create()
    const log = createLogFunction("rotating.test")

    test("basic log", async () => {
      jest.setSystemTime(new Date("2022-11-24T00:00:03.000Z"))

      addLogHandler(rotatingLogFileHandler(TEST_DIRECTORY, fs))

      await log("info", "Test message", { a: 1, b: "hello" })

      jest.setSystemTime(new Date("2022-11-24T00:00:05.000Z"))
      await log("error", "Test message", { a: 2, b: "world", c: { d: true } })

      const logData = fs.readString(logFileName("2022-11-24T00:00:03.000Z.log"))
      expect(logData).toEqual(
        `2022-11-24T00:00:03.000Z [rotating.test] (INFO) Test message {"a":1,"b":"hello"}
2022-11-24T00:00:05.000Z [rotating.test] (ERROR) Test message {"a":2,"b":"world","c":{"d":true}}
`
      )
    })

    it("should write to the same logfile if the difference between the last log < 2 weeks", async () => {
      jest.setSystemTime(new Date("2022-11-24T00:00:03.000Z"))

      addLogHandler(rotatingLogFileHandler(TEST_DIRECTORY, fs))

      await log("info", "Test message", { a: 1, b: "hello" })

      resetLogHandlers()

      addLogHandler(rotatingLogFileHandler(TEST_DIRECTORY, fs))

      jest.setSystemTime(new Date("2022-11-26T00:00:05.000Z"))
      await log("error", "Test message", { a: 2, b: "world", c: { d: true } })

      const logData = fs.readString(logFileName("2022-11-24T00:00:03.000Z.log"))
      expect(logData).toEqual(
        `2022-11-24T00:00:03.000Z [rotating.test] (INFO) Test message {"a":1,"b":"hello"}
2022-11-26T00:00:05.000Z [rotating.test] (ERROR) Test message {"a":2,"b":"world","c":{"d":true}}
`
      )
    })

    it("should not write DEBUG level logs to log file", async () => {
      jest.setSystemTime(new Date("2022-11-24T00:00:03.000Z"))
      addLogHandler(rotatingLogFileHandler(TEST_DIRECTORY, fs))
      await log("debug", "Test message")

      expect(
        fs.readString(logFileName("2022-11-24T00:00:03.000Z.log"))
      ).toBeUndefined()
    })

    it("should create another log file when writing to a log 2 weeks later", async () => {
      jest.setSystemTime(new Date("2022-11-24T00:00:03.000Z"))
      addLogHandler(rotatingLogFileHandler(TEST_DIRECTORY, fs))

      await log("info", "Test message 1")

      // NB: User takes a 2 week vacation
      resetLogHandlers()

      addLogHandler(rotatingLogFileHandler(TEST_DIRECTORY, fs))

      jest.setSystemTime(new Date("2022-12-09T00:00:03.000Z"))
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
  })
})
