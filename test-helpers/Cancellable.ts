/**
 * Creates a {@link Cancellable} that has an empty `cancel` function. This is primarily
 * useful for tests and previews, where nothing actually needs to truly be cancelled.
 *
 * @param promise a promise to wrap in a cancellable.
 */
export const nonCancellable = <T>(promise: Promise<T>) => ({
  value: promise,
  cancel: jest.fn()
})

/**
 * A cancellable that suspends it's promise until `cancel` is called.
 */
export const endlessCancellable = <T>() => {
  let cancel: () => void
  return {
    // eslint-disable-next-line promise/param-names
    value: new Promise<T>((_, reject) => (cancel = reject)),
    cancel: jest.fn().mockImplementation(() => cancel?.())
  }
}
