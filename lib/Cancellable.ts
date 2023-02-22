/**
 * A type that holds a promise with a function to cancel the same promise.
 */
export type Cancellable<T> = {
  value: Promise<T>
  cancel: () => void
}
