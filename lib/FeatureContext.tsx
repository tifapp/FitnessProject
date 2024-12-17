import { mergeWithPartial } from "TiFShared/lib/Object"
import React, { ReactNode, createContext } from "react"

export type FeatureContextProviderProps<
  ContextValues extends Record<string, any>
> = Partial<ContextValues> & { children: ReactNode }

export const featureContext = <ContextValues extends Record<string, any>>(
  initialValues: ContextValues
) => {
  const FeatureContext = createContext(initialValues)
  const useContext = () => React.useContext(FeatureContext)
  return {
    useContext,
    Provider: ({
      children,
      ...values
    }: FeatureContextProviderProps<ContextValues>) => (
      <FeatureContext.Provider
        value={mergeWithPartial(
          useContext(),
          values as unknown as Partial<ContextValues>
        )}
      >
        {children}
      </FeatureContext.Provider>
    )
  }
}
