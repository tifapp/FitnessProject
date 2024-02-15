import { frameTime } from "./FakeTimeInterval"

/**
 * Fakes jest timers for the duration of each test with the ability to step forward in time incrementally. https://stackoverflow.com/questions/42268673/jest-test-animated-view-for-react-native-app
 */
export const withAnimatedTimeTravelEnabled = () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.useRealTimers()
  })
}

export const timeTravel = (time = frameTime) => {
  const tickTravel = () => {
    const now = Date.now()
    jest.setSystemTime(new Date(now + frameTime))
    jest.advanceTimersByTime(frameTime)
  }
  // Step through each of the frames
  const frames = time / frameTime
  for (let i = 0; i < frames; i++) {
    tickTravel() // dont always need to wrap in act
  }
}
