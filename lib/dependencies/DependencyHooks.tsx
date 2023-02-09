import React, { ReactNode, createContext, useContext, useMemo } from "react"
import { DependencyKey } from "./DependencyKey"
import { DependencyValues } from "./DependencyValues"

export const useDependencyValue = <T, >(key: DependencyKey<T>) => {
  return useDependencyValuesContext().get(key)
}

export const useDependencyValues = <
  T extends any[],
  K extends { [I in keyof T]: DependencyKey<I> } = {
    [I in keyof T]: DependencyKey<T[I]>;
  }
>(
    keys: [...K]
  ) => {
  const currentValues = useDependencyValuesContext()
  return keys.map((key) => currentValues.get(key)) as T
}

export type SetDependencyValueProps<T> = {
  forKey: DependencyKey<T>;
  value: T;
  children: ReactNode;
};

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
  update: (values: DependencyValues) => void;
  children: ReactNode;
};

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
  const newValues = useMemo(() => {
    const copiedValues = DependencyValues.copyFrom(currentValues)
    update(copiedValues)
    return copiedValues
  }, [currentValues, update])
  return newValues
}
