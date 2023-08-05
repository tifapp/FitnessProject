export namespace ArrayUtils {
  /**
   * A typesafe way for removing all null/undefined values from an array.
   */
  export const removeOptionals = <T>(arr: (T | null | undefined)[]) => {
    return arr.reduce((acc, curr) => (curr ? [...acc, curr] : acc), [])
  }

  export const compactMap = <A, B>(
    arr: A[],
    mapper: (a: A) => B | undefined | null
  ) => {
    const arrMapped = [] as NonNullable<B>[]
    for (const a of arr) {
      const value = mapper(a)
      if (value) {
        arrMapped.push(value)
      }
    }
    return arrMapped
  }
}
