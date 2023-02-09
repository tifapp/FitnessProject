import { ImmutableDependencyValues } from "./DependencyValues"
import crypto from "crypto"

export type DependencyKey<T> = {
  readonly identifier: string;
  readonly createDefaultValue?: (values: ImmutableDependencyValues) => T;
};

export const createDependencyKey = <T>(
  createDefaultValue?: ((values: ImmutableDependencyValues) => T) | T
): DependencyKey<T> => ({
    identifier: crypto.randomUUID(),
    createDefaultValue: createDefaultValue
      ? _makeDefaultValueCreation(createDefaultValue)
      : undefined
  })

const _makeDefaultValueCreation = <T>(
  create: ((values: ImmutableDependencyValues) => T) | T
) => {
  return (values: ImmutableDependencyValues) => {
    if (create instanceof Function) {
      return create(values)
    }
    return create
  }
}
