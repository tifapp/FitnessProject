import { fakeTimers } from "@test-helpers/Timers"
import {
  clearAutocorrectingInterval,
  setAutocorrectingInterval
} from "./AutocorrectingInterval"

describe("IntervalUtils tests", () => {
  describe("AutocorrectingInterval tests", () => {
    fakeTimers()

    it("should proceed normally when interval function has no inaccuraccies", () => {
      const callback = jest.fn()
      const interval = setAutocorrectingInterval(callback, 1000)
      jest.advanceTimersByTime(500)
      expect(callback).not.toHaveBeenCalled()
      jest.advanceTimersByTime(500)
      expect(callback).toHaveBeenCalledTimes(1)
      jest.advanceTimersByTime(1000)
      expect(callback).toHaveBeenCalledTimes(2)
      clearAutocorrectingInterval(interval)
    })

    it("should stop the count when unsubscribing immediately", () => {
      const callback = jest.fn()
      const interval = setAutocorrectingInterval(callback, 1000)
      clearAutocorrectingInterval(interval)
      jest.advanceTimersByTime(1000)
      expect(callback).not.toHaveBeenCalled()
    })

    it("should stop the count when unsubscribing after a few ticks", () => {
      const callback = jest.fn()
      const interval = setAutocorrectingInterval(callback, 1000)
      jest.advanceTimersByTime(1000)
      expect(callback).toHaveBeenCalledTimes(1)
      clearAutocorrectingInterval(interval)
      jest.advanceTimersByTime(1000)
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it("should be able to run multiple intervals at once", () => {
      const callbacks = [jest.fn(), jest.fn()]
      const interval1 = setAutocorrectingInterval(callbacks[0], 500)
      const interval2 = setAutocorrectingInterval(callbacks[1], 1000)
      jest.advanceTimersByTime(500)
      expect(callbacks[0]).toHaveBeenCalledTimes(1)
      expect(callbacks[1]).toHaveBeenCalledTimes(0)

      jest.advanceTimersByTime(500)
      expect(callbacks[0]).toHaveBeenCalledTimes(2)
      expect(callbacks[1]).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(500)
      expect(callbacks[0]).toHaveBeenCalledTimes(3)
      expect(callbacks[1]).toHaveBeenCalledTimes(1)

      clearAutocorrectingInterval(interval1)

      jest.advanceTimersByTime(500)
      expect(callbacks[0]).toHaveBeenCalledTimes(3)
      expect(callbacks[1]).toHaveBeenCalledTimes(2)

      clearAutocorrectingInterval(interval2)
    })

    it("should invoke the next timeout with the offset of the first oversleep", () => {
      let nextOversleepTime = 30
      const timeoutFn = jest.fn().mockImplementation((callback, millis) => {
        return setTimeout(callback, millis + nextOversleepTime)
      })
      const callback = jest.fn()
      const interval = setAutocorrectingInterval(callback, 100, timeoutFn)

      jest.advanceTimersByTime(100)
      expect(callback).not.toHaveBeenCalled()
      nextOversleepTime = 0
      jest.advanceTimersByTime(30)
      expect(callback).toHaveBeenCalledTimes(1)
      jest.advanceTimersByTime(70)
      expect(callback).toHaveBeenCalledTimes(2)
      clearAutocorrectingInterval(interval)
    })

    it("should invoke the next timeout with the offset of the first undersleep", () => {
      let nextUndersleepTime = 30
      const timeoutFn = jest.fn().mockImplementation((callback, millis) => {
        return setTimeout(callback, millis - nextUndersleepTime)
      })
      const callback = jest.fn()
      const interval = setAutocorrectingInterval(callback, 100, timeoutFn)

      nextUndersleepTime = 0
      jest.advanceTimersByTime(70)
      expect(callback).toHaveBeenCalledTimes(1)
      jest.advanceTimersByTime(100)
      expect(callback).toHaveBeenCalledTimes(1)
      jest.advanceTimersByTime(30)
      expect(callback).toHaveBeenCalledTimes(2)
      clearAutocorrectingInterval(interval)
    })

    it("should use the average offset of all oversleeps when calculating the next timeout", () => {
      let nextOversleepTime = 30
      const timeoutFn = jest.fn().mockImplementation((callback, millis) => {
        return setTimeout(callback, millis + nextOversleepTime)
      })
      const callback = jest.fn()
      const interval = setAutocorrectingInterval(callback, 100, timeoutFn)

      nextOversleepTime = 50
      jest.advanceTimersByTime(130)
      expect(callback).toHaveBeenCalledTimes(1)
      jest.advanceTimersByTime(70)
      expect(callback).toHaveBeenCalledTimes(1)
      nextOversleepTime = 0
      jest.advanceTimersByTime(50)
      expect(callback).toHaveBeenCalledTimes(2)
      jest.advanceTimersByTime(60)
      expect(callback).toHaveBeenCalledTimes(3)
      clearAutocorrectingInterval(interval)
    })

    it("should use the previous sleep time as a basis when calculating the next sleep time for multiple undersleeps", () => {
      let nextUndersleepTime = 30
      const timeoutFn = jest.fn().mockImplementation((callback, millis) => {
        return setTimeout(callback, millis - nextUndersleepTime)
      })
      const callback = jest.fn()
      const interval = setAutocorrectingInterval(callback, 100, timeoutFn)

      nextUndersleepTime = 50
      jest.advanceTimersByTime(70)
      expect(callback).toHaveBeenCalledTimes(1)
      nextUndersleepTime = 0
      jest.advanceTimersByTime(80)
      expect(callback).toHaveBeenCalledTimes(2)
      jest.advanceTimersByTime(100)
      expect(callback).toHaveBeenCalledTimes(2)
      jest.advanceTimersByTime(40)
      expect(callback).toHaveBeenCalledTimes(3)
      clearAutocorrectingInterval(interval)
    })

    test("oversleep, then undersleep", () => {
      let nextOversleepTime = 30
      const timeoutFn = jest.fn().mockImplementation((callback, millis) => {
        return setTimeout(callback, millis + nextOversleepTime)
      })
      const callback = jest.fn()
      const interval = setAutocorrectingInterval(callback, 100, timeoutFn)

      nextOversleepTime = -50
      jest.advanceTimersByTime(130)
      expect(callback).toHaveBeenCalledTimes(1)
      nextOversleepTime = 0
      jest.advanceTimersByTime(20)
      expect(callback).toHaveBeenCalledTimes(2)
      jest.advanceTimersByTime(100)
      expect(callback).toHaveBeenCalledTimes(2)
      jest.advanceTimersByTime(10)
      expect(callback).toHaveBeenCalledTimes(3)
      clearAutocorrectingInterval(interval)
    })
  })
})
