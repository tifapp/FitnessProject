import { createContext, useContext, useMemo, ReactNode } from "react";

const DependenciesContext = createContext<DependencyValues>({});

export interface DependencyValues {}

export type DependenciesProviderProps = {
  values: DependencyValues;
  children: ReactNode;
};

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

export const useDependencies = (): DependencyValues => {
  return useContext(DependenciesContext);
};
