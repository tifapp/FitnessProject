import { ImmutableDependencyValues } from "./DependencyValues"
import { uuid } from "@lib/uuid"

/**
 * A key to that associates itself with a particular type, and is used to retrieve and
 * modify its associated type in the dependencies system.
 *
 * This object should not be created directly, but rather with the `createDependencyKey`
 * function like such.
 *
 * ```ts
 * // A dependency key that refers to the id of the currently logged in user
 * const userIdDependencyKey = createDependencyKey<number>()
 * ```
 *
 * Dependency keys can also be created with default values as follows:
 *
 * ```ts
 * // Create a dependency key for GraphQL operations using Amplify as the default value
 * const keyOperations = new AmplifyGraphQLOperations()
 * const graphQLOperationsDependencyKey = createDependencyKey<GraphQLOperations>(keyOperations)
 * ```
 *
 * Sometimes, we may need another dependency to create a default value for a dependency, this is
 * possible within `createDependenyKey` like such:
 *
 * ```ts
 * // Create the dependency from the logged in user dependency and the `GraphQLOperations` dependency.
 * const userPostsDependencyKey = createDependencyKey<UserPosts>((values) => {
 *  return new GraphQLUserPosts(
 *     values.get(userIdDependencyKey),
 *     values.get(graphQLOperationsDependencyKey)
 *   )
 * })
 * ```
 *
 * Once you have created a dependency key, you can use it inside a react component/hook as such:
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
 * However, make sure that the key has a default or preset value, otherwise an error will be thrown
 * when you try to get the value for the key.
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
 *
 * If you want to access the value for a key that does not have a default value, you can achieve this
 * in 2 ways:
 *
 * ```tsx
 * const key = createDependencyKey<number>()
 *
 * const Component = () => {
 *  // Child components will now get the value 1 when trying to access the value for the key.
 *  return (
 *    <SetDependencyValue forKey={key} value={1}>
 *      {...}
 *    </SetDependencyValue>
 *  )
 * }
 *
 * const Component2 = () => {
 *  // Child components will now get the value 1 when trying to access the value for the key.
 *  // This way is more useful when you try to set multiple dependency values.
 *  return (
 *    <UpdateDependencyValues
 *      update={(values) => {
 *        values.set(key, 1)
 *      }}
 *    >
 *      {...}
 *    </UpdateDependencyValues>
 *  )
 * }
 * ```
 */
export class DependencyKey<T> {
  readonly identifier: string
  readonly createDefaultValue?: (values: ImmutableDependencyValues) => T

  constructor (createDefaultValue?: (values: ImmutableDependencyValues) => T) {
    this.identifier = uuid()
    this.createDefaultValue = createDefaultValue
  }
}

/**
 * Creates a dependency key. A dependency key has a specific associated type, and
 * this key is used to retrieve and modify the associated type in the dependencies
 * system.
 *
 * Dependency keys can be created with or without default values, and also from using other
 * dependencies represented by other dependency keys.
 *
 * If you need to create a default value using other dependencies that have keys, then use
 * the function type of the createDefaultValue argument like such:
 *
 * ```ts
 * // Create the dependency from the logged in user dependency and the `GraphQLOperations` dependency.
 * const userPostsDependencyKey = createDependencyKey<UserPosts>((values) => {
 *  return new GraphQLUserPosts(
 *     values.get(userIdDependencyKey),
 *     values.get(graphQLOperationsDependencyKey)
 *   )
 * })
 * ```
 *
 * @param defaultValue a default value, or a function to create a default value for this key
 */
export const createDependencyKey = <T>(
  defaultValue?: ((values: ImmutableDependencyValues) => T) | T
) => {
  if (!defaultValue) return new DependencyKey<T>()
  return new DependencyKey<T>(makeDefaultValueCreation(defaultValue))
}

const makeDefaultValueCreation = <T>(
  defaultValue: ((values: ImmutableDependencyValues) => T) | T
) => {
  return (values: ImmutableDependencyValues) => {
    if (defaultValue instanceof Function) {
      return defaultValue(values)
    }
    return defaultValue
  }
}
