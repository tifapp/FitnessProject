/**
 * A type that holds a promise with a function to cancel the same promise.
 */
export type Cancellable<T> = {
  value: Promise<T>
  cancel: () => void
}

/**
 * Creates a {@link Cancellable} that has an empty `cancel` function. This is primarily
 * useful for tests and previews, where nothing actually needs to truly be cancelled.
 *
 * @param promise a promise to wrap in a cancellable.
 */
export const emptyCancellable = <T>(promise: Promise<T>) => ({
  value: promise,
  cancel: () => {}
})

/**
 * Runs the `cancel` fucntion of a given {@link Cancellable} when
 * an {@link AbortSignal} is aborted.
 *
 * @param cancellable the cancellable to cancel when the signal aborts.
 * @param signal a signal from an {@link AbortController}.
 * @returns the same cancellable given to this function.
 */
export const cancelOnAborted = <T>(
  cancellable: Cancellable<T>,
  signal: AbortSignal
) => {
  signal.addEventListener("abort", () => cancellable.cancel())
  return cancellable
}
