/**
 * Creates a promise that never resolves.
 */
export const neverPromise = <T>() => new Promise<T>(() => { })
