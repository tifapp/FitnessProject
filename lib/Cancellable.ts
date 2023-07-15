if (process.env.TEST_RUNNER_CI) {
  global.fetch = require("node-fetch")
}

// eslint-disable-next-line import/first
import "abortcontroller-polyfill/dist/polyfill-patch-fetch"

/**
 * A type that holds a promise with a function to cancel the same promise.
 */
export type Cancellable<T> = {
  value: Promise<T>
  cancel: () => void
}

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
  signal?: AbortSignal
) => {
  signal?.addEventListener("abort", () => cancellable.cancel())
  return cancellable
}
