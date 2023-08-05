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
    const fs = TestFilesystem.create()
    const log = createLogFunction("rotating.test")

    test("basic log", async () => {
      jest.setSystemTime(new Date("2022-11-24T00:00:03+0000"))

      addLogHandler(rotatingLogFileHandler("test", fs))

      log("info", "Test message", { a: 1, b: "hello" })
      jest.setSystemTime(new Date("2022-11-24T00:00:05+0000"))

      log("error", "Test message", { a: 2, b: "world", c: { d: true } })

      const logData = fs.readString("test/2022-11-24T00:00:03.000Z.log")
      expect(logData).toEqual(
        `2022-11-24T00:00:03.000Z [rotating.test] (INFO) Test message {"a":1,"b":"hello"}
2022-11-24T00:00:05.000Z [rotating.test] (ERROR) Test message {"a":2,"b":"world","c":{"d":true}}
`
      )
    })

    it("should not write DEBUG level logs to log file", () => {
      jest.setSystemTime(new Date("2022-11-24T00:00:03+0000"))
      addLogHandler(rotatingLogFileHandler("test", fs))
      log("debug", "Test message")

      expect(fs.readString("test/2022-11-24T00:00:03.000Z.log")).toBeUndefined()
    })
  })
})
