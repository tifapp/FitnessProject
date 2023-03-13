import { z, ZodTypeAny } from "zod"

/**
 * A helper type to ensure an array has at least 1 element.
 */
export type NonEmptyArray<T> = [T, ...T[]]

/**
 * Creates a zod schema for a {@link NonEmptyArray}.
 */
export const NonEmptyArraySchema = <
  TransformValue,
  ArrayValue extends ZodTypeAny = ZodTypeAny
>(
    zodArray: ArrayValue
  ) => {
  return z
    .array(zodArray)
    .nonempty()
    .transform((v) => v as NonEmptyArray<TransformValue>)
}

export namespace ArrayUtils {
  /**
   * A typesafe way for removing all null/undefined values from an array.
   */
  export const removeOptionals = <T>(arr: (T | null | undefined)[]) => {
    return arr.reduce((acc, curr) => (curr ? [...acc, curr] : acc), [])
  }

  /**
   * Returns the last element of a non-empty array.
   */
  export const lastElementNonEmpty = <T>(arr: NonEmptyArray<T>) => {
    return arr[arr.length - 1]
  }
}
