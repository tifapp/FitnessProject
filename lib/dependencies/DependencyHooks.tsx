import React, { ReactNode, createContext, useContext, useMemo } from "react"
import { DependencyKey } from "./DependencyKey"
import { DependencyValues } from "./DependencyValues"

/**
 * Retrieves the dependency value for a given key.
 *
 * Use this hook when you need a dependency in the current component like so. Make sure
 * that the key you use was created from `createDependencyKey`.
 *
 * ```ts
 * const key = createDependencyKey(1)
 *
 * const Component = () => {
 *   const dependency = useDependencyValues(key); // dependency = 1
 *   // ...
 * }
 * ```
 *
 * However, be careful, if the key does not have a default value, an error will be thrown.
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
 * There are 2 ways to make a dependency key without a default value not throw an error:
 *
 * ```ts
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
 *
 * @param key a `DependencyKey` instance.
 * @returns the value associated with `key`.
 */
export const useDependencyValue = <T, >(key: DependencyKey<T>) => {
  return useDependencyValuesContext().get(key)
}

/**
 * Retrieves the dependencies for multiple dependency keys. Note that an explicit tuple
 * return type (eg, `[string, string]`) must by passed as the first generic type argument.
 *
 * Use this hook when you need a dependency in the current component like so. Make sure
 * that the key you use was created from `createDependencyKey`.
 *
 * ```ts
 * const key1 = createDependencyKey(1)
 * const key2 = createDependencyKey("hello")
 *
 * const Component = () => {
 *   const [d1, d2] = useDependencyValues<[number, string]>([key1, key2]); // d1 = 1, d2 = "hello"
 *   // ...
 * }
 * ```
 *
 * However, be careful, if the key does not have a default value, an error will be thrown.
 *
 * ```ts
 * const key = createDependencyKey<number>()
 *
 * const Component = () => {
 *   // 🔴 Throws an error, the dependency key does not have a default value.
 *   const [dependency] = useDependencyValues<[number]>([key])
 *   // ...
 * }
 * ```
 *
 * There are 2 ways to make a dependency key without a default value not throw an error:
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
 *
 * @param keys the `DependencyKey`s to use to retrieve their values in the dependencies system.
 * @returns a tuple type of all the dependencies returned.
 */
export const useDependencyValues = <
  T extends any[],
  K extends { [I in keyof T]: DependencyKey<I> } = {
    [I in keyof T]: DependencyKey<T[I]>
  }
>(
    keys: [...K]
  ) => {
  const currentValues = useDependencyValuesContext()
  return keys.map((key) => currentValues.get(key)) as T
}

export type SetDependencyValueProps<T> = {
  forKey: DependencyKey<T>
  value: T
  children: ReactNode
}

/**
 * Sets the dependency value for a particular key in a child context. This is most useful
 * when you need to update the value just for a single dependency, if you need to update
 * the values for multiple dependencies, use `UpdateDependencyValues` instead.
 *
 * Using this will override the default/pre-existing value of the specified key.
 *
 * ```tsx
 * const key = createDependencyKey(1);
 *
 * const Component = () => {
 *  // Child components will now get the value 2 when trying to access the value for the key.
 *  return (
 *    <SetDependencyValue forKey={key} value={2}>
 *      {...}
 *    </SetDependencyValue>
 *  )
 * }
 * ```
 */
export const SetDependencyValue = <T, >({
  forKey: key,
  value,
  children
}: SetDependencyValueProps<T>) => {
  const newValues = useUpdateCopiedDependencyValues((values) => {
    values.set(key, value)
  })
  return (
    <DependencyValuesContext.Provider value={newValues}>
      {children}
    </DependencyValuesContext.Provider>
  )
}

export type UpdateDependencyValuesProps = {
  update: (values: DependencyValues) => void
  children: ReactNode
}

/**
 * Updates an instance of `DependencyValues` specifically for the child context to use.
 *
 * Use this component when you need to set the values of 2 or more dependencies. If you
 * only need to set the value of 1 dependency, use `SetDependencyValue`.
 *
 * Using this will override any of the values for the given dependency keys.
 *
 * ```tsx
 * const key1 = createDependencyKey(1);
 * const key2 = createDependencyKey("hello");
 *
 * const Component = () => {
 *   // Child components will now receive 2 for key1 and "world" for key2
 *   return (
 *     <UpdateDependencyValues
 *       update={(values) => {
 *         values.set(key1, 2);
 *         values.set(key2, "world")
 *       }}
 *     >
 *       {...}
 *     </UpdateDependencyValues>
 *   )
 * }
 * ```
 */
export const UpdateDependencyValues = ({
  update,
  children
}: UpdateDependencyValuesProps) => {
  const newValues = useUpdateCopiedDependencyValues(update)
  return (
    <DependencyValuesContext.Provider value={newValues}>
      {children}
    </DependencyValuesContext.Provider>
  )
}

const DependencyValuesContext = createContext(new DependencyValues())

const useDependencyValuesContext = () => useContext(DependencyValuesContext)

const useUpdateCopiedDependencyValues = (
  update: (values: DependencyValues) => void
) => {
  const currentValues = useDependencyValuesContext()
  return useMemo(() => {
    const copiedValues = DependencyValues.__copyFrom(currentValues)
    update(copiedValues)
    return copiedValues
  }, [currentValues, update])
}
