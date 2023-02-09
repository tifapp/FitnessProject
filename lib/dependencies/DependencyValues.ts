import { DependencyKey } from "./DependencyKey"

export interface ImmutableDependencyValues {
  get: <T>(key: DependencyKey<T>) => T;
}

export class DependencyValues implements ImmutableDependencyValues {
  private cachedValues = new Map<string, any>()

  get<T> (key: DependencyKey<T>): T {
    const cachedValue = this.cachedValues.get(key.identifier)
    if (cachedValue) return cachedValue as T

    if (!key.createDefaultValue) {
      throw new Error("TODO: - Add Error Message")
    }

    const value = key.createDefaultValue(this)
    this.cachedValues.set(key.identifier, value)
    return value
  }

  set<T> (key: DependencyKey<T>, value: T) {
    this.cachedValues.set(key.identifier, value)
  }

  static copyFrom (values: DependencyValues): DependencyValues {
    const newValues = new DependencyValues()
    newValues.cachedValues = new Map(values.cachedValues)
    return newValues
  }
}
