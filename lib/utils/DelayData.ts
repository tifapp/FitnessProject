/**
 * Sleeps for the specified duration of milliseconds
 * before resolving to the given value.
 *
 * @param value the value to return.
 * @param millis the number of milliseconds to sleep.
 * @param abortSignal an {@link AbortSignal} that can be used to cancel the sleep.
 * @returns `value`
 */
export const delayData = async <T>(
  value: T,
  millis: number = 10_000,
  abortSignal?: AbortSignal
) => {
  return await new Promise<T>((resolve, reject) => {
    // eslint-disable-next-line prefer-const
    let timeoutId: NodeJS.Timeout | undefined
    const rejecter = () => {
      reject(new Error("Delay cancelled"))
      clearTimeout(timeoutId)
    }
    abortSignal?.addEventListener("abort", rejecter)
    timeoutId = setTimeout(() => {
      resolve(value)
      abortSignal?.removeEventListener("abort", rejecter)
    }, millis)
  })
}

/**
 * Sleeps for the specified amount of milliseconds.
 *
 * @param millis the number of milliseconds to sleep.
 * @param abortSignal an {@link AbortSignal} that can be used to cancel the sleep.
 */
export const sleep = async (millis: number, abortSignal?: AbortSignal) => {
  await delayData(undefined, millis, abortSignal)
}
