import { mergeWithPartial } from "TiFShared/lib/Object"
import React, { ReactNode, createContext } from "react"

export type FeatureContextProviderProps<
  ContextValues extends Record<string, any>
> = Partial<ContextValues> & { children: ReactNode }

/**
 * Returns a context and a hook to use the context using our pattern for passing data functions
 * to features via a context.
 *
 * Ex.
 * ```ts
 * export const MyCoolFeature = featureContext({
 *   fetchData: async () => {
 *     // Fetch...
 *   }
 * })
 *
 * export const MyCoolFeatureView = () => {
 *   const { fetchData } = MyCoolFeature.useContext()
 *   // Do stuff with data fn...
 *   return <UI />
 * }
 *
 * export const MockFeatureView = () => (
 *  // Provide a fetch mock for the actual view for testing/storybook purposes.
 *  <MyCoolFeature.Provider fetchData={mockFetch}>
 *    <MyCoolFeatureView />
 *  </MyCoolFeature>
 * )
 * ```
 *
 * @param initialValues The default values to pass to the context.
 * @returns A provider component and a hook to consume the context.
 */
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
