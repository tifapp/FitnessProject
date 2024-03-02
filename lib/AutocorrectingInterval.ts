export type AutocorrectingInterval = number
export type TimeoutFunction = (
  callback: () => void,
  millis: number
) => NodeJS.Timeout

let currentId = 0 as AutocorrectingInterval
const intervals = new Map<number, NodeJS.Timeout>()

/**
 * Sets an interval that automatically adjusts the delay between each
 * interval tick by the average of all sleep inaccuracies.
 * (eg. If one interval tick sleeps for 50ms more than the given `millis`,
 * then the next duration tick will be adjusted to
 * `millis - (previousAverageOffset + 50) / 2`.)
 *
 * @returns An identifier that should be passed to
 * {@link clearAutocorrectingInterval} that cancels the interval.
 */
export const setAutocorrectingInterval = (
  callback: () => void,
  millis: number,
  timeoutFn: TimeoutFunction = setTimeout
): AutocorrectingInterval => {
  const id = currentId++
  let nowTime = Date.now()
  let currentIntervalMillis = millis
  let averageSleepOffset: number | undefined
  const run = () => {
    callback()
    const endTime = Date.now()
    const currentSleepOffset = endTime - nowTime - currentIntervalMillis
    averageSleepOffset = averageSleepOffset
      ? (averageSleepOffset + currentSleepOffset) / 2
      : currentSleepOffset
    nowTime = endTime
    currentIntervalMillis = millis - averageSleepOffset
    intervals.set(id, timeoutFn(run, currentIntervalMillis))
  }
  intervals.set(id, timeoutFn(run, millis))
  return id
}

/**
 * Clears and stops an {@link AutocorrectingInterval} created by
 * {@link setAutocorrectingInterval}.
 */
export const clearAutocorrectingInterval = (
  interval: AutocorrectingInterval
) => {
  clearTimeout(intervals.get(interval))
  intervals.delete(interval)
}