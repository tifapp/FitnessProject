/**
 * A simple type for representing a JSON serializable value (ie. It works with `JSON.stringify`).
 */
export type JSONSerializableValue =
  | string
  | number
  | boolean
  | { [key: string | number]: JSONSerializableValue }
  | JSONSerializableValue[]
  | null
  | Date
