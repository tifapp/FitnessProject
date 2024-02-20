export namespace ArrayUtils {
  /**
   * Returns a random element from an array which has at least one element.
   */
  export const randomElement = <T>(arr: T[]) => {
    return arr[Math.floor(Math.random() * arr.length)]
  }
  /**
   * Maps an array using a transform function, but removes any `null` or
   * `undefined` values from the array.
   */
  export const compactMap = <A, B>(
    arr: A[],
    mapper: (a: A, index: number) => B | undefined | null
  ) => {
    return arr.reduce((acc, curr, index) => {
      const mapped = mapper(curr, index)
      if (mapped) acc.push(mapped)
      return acc
    }, [] as NonNullable<B>[])
  }

  /**
   * Creates an array that repeats the element given to it a certain number of times (the right way...).
   *
   * @param times the number of times to repeat the given element.
   * @param element a value or function to create the repeated element.
   * @returns an array with repeated elements.
   */
  export const repeatElements = <T>(
    times: number,
    element: ((time: number) => T) | T
  ) => {
    return (Array.apply(null, Array(times)) as null[]).map((_, index) => {
      if (element instanceof Function) {
        return element(index)
      }
      return element
    })
  }
}
