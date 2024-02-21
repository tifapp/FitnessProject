import { act } from "@testing-library/react-native"
import { TEST_FRAME_TIME } from "./FakeTimeInterval"

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
 * Incrementally advances all timers by the given time.
 *
 * The timers are advanced by increments of:
 * `time / TEST_FRAME_TIME`.
 */
export const timeTravel = (timeMillis = TEST_FRAME_TIME) => {
  const frames = timeMillis / TEST_FRAME_TIME
  for (let i = 0; i < frames; i++) {
    const now = Date.now()
    jest.setSystemTime(new Date(now + TEST_FRAME_TIME))
    jest.advanceTimersByTime(TEST_FRAME_TIME)
  }
}
