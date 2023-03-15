/**
 * A type that returns a union of all keys in an object that extend a value
 * of type `T`.
 */
export type KeysWithValueType<Object, T> = NonNullable<
  {
    [I in keyof Object]: Object[I] extends T ? I : never
  }[keyof Object]
>
