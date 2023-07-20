/**
 * Sleeps for the specified duration of milliseconds
 * before resolving to the given value.
 *
 * @param value the value to return.
 * @param millis the number of milliseconds to sleep.
 * @returns `value`
 */
export const delayData = async <T>(value: T, millis: number = 10_000) => {
  return await new Promise((resolve) => {
    setTimeout(() => resolve(value), millis)
  })
}
