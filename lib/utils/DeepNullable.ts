/**
 * Unions all properties of a given object with `null`.
 */
export type DeepNullable<T> = {
  [K in keyof T]: DeepNullable<T[K]> | null
}
