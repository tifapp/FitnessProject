/**
 * Fakes jest timers for the duration of each test.
 */
export const fakeTimers = () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())
}
