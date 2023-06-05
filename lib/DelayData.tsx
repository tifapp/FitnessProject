export const delayData = <T, >(value: T): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(value), 10000))
}
