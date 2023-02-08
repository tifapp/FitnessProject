import crypto from "crypto";

export class DependencyValues {
  private cachedValues = new Map<string, any>();

  get<T>(key: DependencyKey<T>): T {
    const cachedValue = this.cachedValues.get(key.identifier);
    if (cachedValue) return cachedValue as T;

    if (!key.createDefaultValue) {
      throw new Error("TODO: - Add Error Message");
    }

    const value = key.createDefaultValue(new ImmutableDependencyValues(this));
    this.cachedValues.set(key.identifier, value);
    return value;
  }

  set<T>(key: DependencyKey<T>, value: T) {
    this.cachedValues.set(key.identifier, value);
  }

  static copyFrom(values: DependencyValues): DependencyValues {
    const newValues = new DependencyValues();
    newValues.cachedValues = new Map(values.cachedValues);
    return newValues;
  }
}

class ImmutableDependencyValues {
  private readonly values: DependencyValues;

  constructor(values: DependencyValues) {
    this.values = values;
  }

  get<T>(key: DependencyKey<T>): T {
    return this.values.get(key);
  }
}

type DependencyKey<T> = {
  readonly identifier: string;
  readonly createDefaultValue?: (values: ImmutableDependencyValues) => T;
};

export const createDependencyKey = <T>(
  createDefaultValue?: (values: ImmutableDependencyValues) => T
): DependencyKey<T> => ({
  identifier: crypto.randomUUID(),
  createDefaultValue,
});
