import { DependencyKey } from "./DependencyKey"

/**
 * A table of `DependencyKey` instances to the values held by the stored dependency keys.
 *
 * To access any of the values in here from a react component, you can use the
 * `useDependencyValue` or `useDepenencyValues` hooks which take in keys created returned
 * from `createDependencyKey`:
 *
 * ```ts
 * const Component = () => {
 *   // Retrieve a single dependency value inside a react component.
 *   const dependency = useDependencyValue(key);
 *   // ...
 * }
 *
 * const Component2 = () => {
 *   // Retrieve multiple dependency values inside a react component.
 *   const [dependency1, dependency2] = useDependencyValues<[D1Type, D2Type]>([key1, key2]);
 *   // ...
 * }
 * ```
 *
 * Whenever a dependency value is accessed with its respective `DependencyKey`, the default
 * value is cached by this class. This ensures that the dependency isn't recreated everytime
 * it's accessed, which is more performant, and preserves any state that the dependency may
 * have held across accesses.
 *
 * ```ts
 * const key = createDependencyKey<number>(() => {
 *  return createDependencyInASuperExpensiveWay()
 * })
 *
 * const Component = () => {
 *   const dependency = useDependencyValue(key)
 *
 *   // This call returns a cached instance of the dependency, which prevents
 *   // its super expensive creation from being ran twice.
 *   const dependency2 = useDependencyValue(key)
 *   // ...
 * }
 * ```
 *
 * When a `DependencyKey` does not include a default value, or a way to create a default value,
 * if no cached value is set for the key, an error will be thrown when trying to access the value
 * for the key.
 *
 * ```ts
 * const key = createDependencyKey<number>()
 *
 * const Component = () => {
 *   // 🔴 Throws an error, the dependency key does not have a default value.
 *   const dependency = useDependencyValue(key)
 *   // ...
 * }
 * ```
 */
export class DependencyValues {
  private cachedValues = new Map<string, any>()

  /**
   * Retrieves the value for the specified dependency key, or attempts to create
   * its default value if there is no previously set value. If no value can be
   * created or retrieved, this method will throw an error.
   *
   * Subsequent accesses to this method return a cached value for the same key.
   *
   * @param key a `DependencyKey` instance.
   * @returns the generic type specified by `key`'s type
   */
  get<T> (key: DependencyKey<T>) {
    const cachedValue = this.cachedValues.get(key.identifier)
    if (cachedValue) return cachedValue as T

    if (!key.createDefaultValue) {
      throw new Error(`
      Attempted to create the default value for a dependency key which has no default value.

      To fix this, you can do any one of the following: 
        - Pass in the default value for the key when calling createDependencyKey
        - Call .set on this instance of DependencyValues with the key if possible
        - If in a react component/hook, wrap the current component with SetDependencyValue or UpdateDependencyValues

      Dependency Key identifier: ${key.identifier}
      `)
    }

    const value = key.createDefaultValue(new ImmutableDependencyValues(this))
    this.cachedValues.set(key.identifier, value)
    return value
  }

  /**
   * Sets the value for a particular dependency key. Subsequent calls to `get`
   * using the same key will use the value set by this method instead of the
   * key's default or previous value.
   *
   * @param key a `DependencyKey` instance.
   * @param value a value of the same type specified by the generic of `key`'s type
   */
  set<T> (key: DependencyKey<T>, value: T) {
    this.cachedValues.set(key.identifier, value)
  }

  /**
   * Copies a `DependencyValues` and returns the copied values.
   *
   * Generally, you shouldn't need to use this function directly, as the copying is
   * handled by `SetDependencyValue` and `UpdateDependencyValues`.
   *
   * @param values the `DependencyValues` instance to copy.
   */
  static copyFrom (values: DependencyValues) {
    const newValues = new DependencyValues()
    newValues.cachedValues = new Map(values.cachedValues)
    return newValues
  }
}

/**
 * An immutable store of `DependencyValues`.
 *
 * When creating a dependency that relies on another dependency, `createDependencyKey`
 * passes this interface to the function passed in as its parameter. This allows you to
 * use other existing dependencies to create a new dependency.
 *
 * ```ts
 * // Create the dependency from the logged in user dependency and the `GraphQLOperations` dependency.
 * const userPostsDependencyKey = createDependencyKey((values) => {
 *  return new GraphQLUserPosts(
 *     values.get(userIdDependencyKey),
 *     values.get(graphQLOperationsDependencyKey)
 *   )
 * })
 * ```
 *
 * This type solely exists to make it possible to create dependencies from other dependencies
 * without modifying the underlying `DependencyValues`.
 */
export class ImmutableDependencyValues {
  private readonly values: DependencyValues

  constructor (values: DependencyValues) {
    this.values = values
  }

  /**
   * Retrieves the value for the specified dependency key, or attempts to create
   * its default value if there is no previously set value. If no value can be
   * created or retrieved, this method will throw an error.
   *
   * Subsequent accesses to this method return a cached value for the same key.
   *
   * @param key a `DependencyKey` instance.
   * @returns the generic type specified by `key`'s type
   */
  get<T> (key: DependencyKey<T>) {
    return this.values.get(key)
  }
}
