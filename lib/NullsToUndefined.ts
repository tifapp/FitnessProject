/**
 * A type which ensures that all `null` values become `undefined`.
 *
 * See: https://stackoverflow.com/questions/50374869/generic-way-to-convert-all-instances-of-null-to-undefined-in-typescript
 */
export type NullsAsUndefined<T> = T extends null
  ? undefined
  : T extends Date
  ? T
  : {
      [K in keyof T]: T[K] extends (infer U)[]
        ? NullsAsUndefined<U>[]
        : NullsAsUndefined<T[K]>
    }

/**
 * Converts null values of an object to undefined.
 *
 * @param value the object
 */
export const nullsToUndefined = <T>(value: T) => {
  if (value === null) return undefined as NullsAsUndefined<T>
  if (typeof value !== "object") return value as NullsAsUndefined<T>

  // NB: For the bottom 2 cases we must extract out a local variable instead
  // of returning directly to make the compiler happy.

  if (value instanceof Array) {
    const array = value.map(nullsToUndefined) as NullsAsUndefined<T>
    return array
  }

  const object = Object.fromEntries(
    Object.entries(value).map(([key, val]) => [key, nullsToUndefined(val)])
  ) as NullsAsUndefined<T>
  return object
}
