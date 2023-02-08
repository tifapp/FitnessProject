import { createDependencyKey, DependencyValues } from "@lib/Dependencies";

describe("DependencyValues tests", () => {
  it("creates a dependency key's default value on first access", () => {
    const values = new DependencyValues();
    const key = createDependencyKey(() => 1);
    expect(values.get(key)).toEqual(1);
  });

  it("caches the default value for a dependency key on first access", () => {
    const values = new DependencyValues();
    const key = createDependencyKey(jest.fn().mockReturnValue(1));
    values.get(key); // NB: this call should cache the default value from the key
    const value2 = values.get(key);

    expect(value2).toEqual(1);
    expect(key.createDefaultValue).toHaveBeenCalledTimes(1);
  });

  it("throws when retrieving dependency with no default value creation and no cached value", () => {
    const values = new DependencyValues();
    const key = createDependencyKey();
    expect(() => values.get(key)).toThrow();
  });

  it("allows a dependency key default value to be initialzed from another dependency", () => {
    const key1 = createDependencyKey(() => 1);
    const key2 = createDependencyKey((values) => values.get(key1) + 1);
    const values = new DependencyValues();
    expect(values.get(key2)).toEqual(2);
  });

  it("uses the preset value instead of the key default value", () => {
    const key = createDependencyKey<number>(() => 2);
    const values = new DependencyValues();
    values.set(key, 1);
    expect(values.get(key)).toEqual(1);
  });

  it("uses the preset value when a dependency key has not default value creation", () => {
    const key = createDependencyKey<number>();
    const values = new DependencyValues();
    values.set(key, 1);
    expect(values.get(key)).toEqual(1);
  });

  it("can create copies of itself", () => {
    const key = createDependencyKey<number>();
    const originalValues = new DependencyValues();
    const newValues = DependencyValues.copyFrom(originalValues);
    newValues.set(key, 1);

    expect(newValues.get(key)).toEqual(1);
    expect(() => originalValues.get(key)).toThrow();
  });
});
