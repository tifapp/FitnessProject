export namespace ArrayUtils {
  /**
   * A typesafe way for filtering all null/undefined values from an array.
   */
  export const takeNonNulls = <T>(arr: (T | null | undefined)[]) => {
    return arr.reduce((acc, curr) => (curr ? [...acc, curr] : acc), [] as T[])
  }
}
