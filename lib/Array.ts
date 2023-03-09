/**
 * A helper type to ensure an array has at least 1 element.
 */
export type NonEmptyArray<T> = [T, ...T[]]

export namespace ArrayUtils {
  /**
   * A typesafe way for filtering all null/undefined values from an array.
   */
  export const takeNonNulls = <T>(arr: (T | null | undefined)[]) => {
    return arr.reduce((acc, curr) => (curr ? [...acc, curr] : acc), [] as T[])
  }

  /**
   * Returns the last element of a non-empty array.
   */
  export const lastElementNonEmpty = <T>(arr: NonEmptyArray<T>) => {
    return arr[arr.length - 1]
  }
}
