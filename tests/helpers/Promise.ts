/**
 * Creates a promise that never resolves.
 */
export const neverPromise = <T>() => new Promise<T>(() => {})

/**
 * Returns a promise along with functions to resolve and reject it.
 */
export const promiseComponents = <T>() => {
  let resolver: (value: T) => void = () => {}
  let rejecter: (value: unknown) => void = () => {}
  const promise = new Promise<T>((resolve, reject) => {
    resolver = resolve
    rejecter = reject
  })
  return { resolver, rejecter, promise }
}
