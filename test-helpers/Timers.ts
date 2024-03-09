import { act } from "@testing-library/react-native"
import { TEST_FRAME_TIME } from "./FakeTimeInterval"
import { now } from "@date-time"

/**
 * Fakes jest timers for the duration of each test with the ability to step
 * forward in time incrementally.
 *
 * See: https://stackoverflow.com/questions/42268673/jest-test-animated-view-for-react-native-app
 */
export const fakeTimers = () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(async () => {
    await act(async () => await jest.runOnlyPendingTimersAsync())
    jest.useRealTimers()
  })
}

/**
 * Advances all timers by the given time and current date simultaneously.
 */
export const timeTravel = (timeMillis = TEST_FRAME_TIME) => {
  // jest.setSystemTime(now().add(timeMillis, "milliseconds").toDate())
  jest.advanceTimersByTime(timeMillis)
}
