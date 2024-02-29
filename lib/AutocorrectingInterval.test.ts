import { fakeTimers, timeTravel } from "@test-helpers/Timers"
import {
  clearAutocorrectingInterval,
  setAutocorrectingInterval
} from "./AutocorrectingInterval"

describe("IntervalUtils tests", () => {
  describe("AutocorrectingInterval tests", () => {
    fakeTimers()

    beforeEach(() => {
      jest.setSystemTime(new Date(0))
      // NB: For some reason jest is adding 1000ms to only first time travels
      // in each test, so we'll exhaust it here...
      // timeTravel(1000)
    })

    it("should proceed normally when interval function has no inaccuraccies", () => {
      const callback = jest.fn()
      const interval = setAutocorrectingInterval(callback, 1000)
      timeTravel(500)
      expect(callback).not.toHaveBeenCalled()
      timeTravel(500)
      expect(callback).toHaveBeenCalledTimes(1)
      timeTravel(1000)
      expect(callback).toHaveBeenCalledTimes(2)
      clearAutocorrectingInterval(interval)
    })

    it("should stop the count when unsubscribing immediately", () => {
      const callback = jest.fn()
      const interval = setAutocorrectingInterval(callback, 1000)
      clearAutocorrectingInterval(interval)
      timeTravel(1000)
      expect(callback).not.toHaveBeenCalled()
    })

    it("should stop the count when unsubscribing after a few ticks", () => {
      const callback = jest.fn()
      const interval = setAutocorrectingInterval(callback, 1000)
      timeTravel(1000)
      expect(callback).toHaveBeenCalledTimes(1)
      clearAutocorrectingInterval(interval)
      timeTravel(1000)
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it("should be able to run multiple intervals at once", () => {
      const callbacks = [jest.fn(), jest.fn()]
      const interval1 = setAutocorrectingInterval(callbacks[0], 500)
      const interval2 = setAutocorrectingInterval(callbacks[1], 1000)
      timeTravel(500)
      expect(callbacks[0]).toHaveBeenCalledTimes(1)
      expect(callbacks[1]).toHaveBeenCalledTimes(0)

      timeTravel(500)
      expect(callbacks[0]).toHaveBeenCalledTimes(2)
      expect(callbacks[1]).toHaveBeenCalledTimes(1)

      timeTravel(500)
      expect(callbacks[0]).toHaveBeenCalledTimes(3)
      expect(callbacks[1]).toHaveBeenCalledTimes(1)

      clearAutocorrectingInterval(interval1)

      timeTravel(500)
      expect(callbacks[0]).toHaveBeenCalledTimes(3)
      expect(callbacks[1]).toHaveBeenCalledTimes(2)

      clearAutocorrectingInterval(interval2)
    })

    it("should invoke the next timeout with a lower millis count if first timeout overslept", () => {
      let nextOversleepTime = 30
      const timeoutFn = jest.fn().mockImplementation((callback, millis) => {
        return setTimeout(callback, millis + nextOversleepTime)
      })
      const callback = jest.fn()
      const interval = setAutocorrectingInterval(callback, 100, timeoutFn)

      timeTravel(100)
      expect(callback).not.toHaveBeenCalled()
      nextOversleepTime = 0
      timeTravel(30)
      expect(callback).toHaveBeenCalledTimes(1)
      timeTravel(70)
      expect(callback).toHaveBeenCalledTimes(2)
      clearAutocorrectingInterval(interval)
    })

    it("should invoke the next timeout with a higher millis count if first timeout underslept", () => {
      let nextUndersleepTime = 30
      const timeoutFn = jest.fn().mockImplementation((callback, millis) => {
        return setTimeout(callback, millis - nextUndersleepTime)
      })
      const callback = jest.fn()
      const interval = setAutocorrectingInterval(callback, 100, timeoutFn)

      nextUndersleepTime = 0
      timeTravel(70)
      expect(callback).toHaveBeenCalledTimes(1)
      timeTravel(100)
      expect(callback).toHaveBeenCalledTimes(1)
      timeTravel(30)
      expect(callback).toHaveBeenCalledTimes(2)
      clearAutocorrectingInterval(interval)
    })

    it("should use the previous sleep time as a basis when calculating the next sleep time for multiple oversleeps", () => {
      let nextOversleepTime = 30
      const timeoutFn = jest.fn().mockImplementation((callback, millis) => {
        return setTimeout(callback, millis + nextOversleepTime)
      })
      const callback = jest.fn()
      const interval = setAutocorrectingInterval(callback, 100, timeoutFn)

      nextOversleepTime = 50
      timeTravel(130)
      expect(callback).toHaveBeenCalledTimes(1)
      timeTravel(70)
      expect(callback).toHaveBeenCalledTimes(1)
      nextOversleepTime = 0
      timeTravel(50)
      expect(callback).toHaveBeenCalledTimes(2)
      timeTravel(60)
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
      timeTravel(70)
      expect(callback).toHaveBeenCalledTimes(1)
      nextUndersleepTime = 0
      timeTravel(80)
      expect(callback).toHaveBeenCalledTimes(2)
      timeTravel(100)
      expect(callback).toHaveBeenCalledTimes(2)
      timeTravel(40)
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
      timeTravel(130)
      expect(callback).toHaveBeenCalledTimes(1)
      nextOversleepTime = 0
      timeTravel(20)
      expect(callback).toHaveBeenCalledTimes(2)
      timeTravel(100)
      expect(callback).toHaveBeenCalledTimes(2)
      timeTravel(10)
      expect(callback).toHaveBeenCalledTimes(3)
      clearAutocorrectingInterval(interval)
    })
  })
})
