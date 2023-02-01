import { createContext, useContext, useMemo, ReactNode } from "react";

const DependenciesContext = createContext<DependencyValues>({});

/**
 * The interface containing all dependencies in the app.
 */
export interface DependencyValues {}

export type DependenciesProviderProps = {
  values: DependencyValues;
  children: ReactNode;
};

/**
 * Provides a child context access to the specified dependency values.
 */
export const DependenciesProvider = ({
  values,
  children,
}: DependenciesProviderProps) => (
  <DependenciesContext.Provider value={values}>
    {children}
  </DependenciesContext.Provider>
);

export type TransformDependenciesProps = {
  transform: (_: DependencyValues) => DependencyValues;
  children: ReactNode;
};

/**
 * A convenience component to transform the dependencies from
 * one context to another.
 *
 * For this project in particular, this is useful for instantiating
 * dependencies that require an authenticated user.
 */
export const TransformDependencies = ({
  transform,
  children,
}: TransformDependenciesProps) => {
  const dependencyValues = useDependencies();
  const newValues = useMemo(
    () => transform(dependencyValues),
    [dependencyValues]
  );
  return (
    <DependenciesProvider values={newValues}>{children}</DependenciesProvider>
  );
};

/**
 * Returns the current dependency values in for the given context.
 */
export const useDependencies = (): DependencyValues => {
  return useContext(DependenciesContext);
};
