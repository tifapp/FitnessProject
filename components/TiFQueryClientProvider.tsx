import React, { ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "react-query"

const tiFQueryClient = new QueryClient()

export type TiFQueryClientProviderProps = {
  children: ReactNode
}

/**
 * Default `QueryClientProvider` for the app.
 */
export const TiFQueryClientProvider = ({
  children
}: TiFQueryClientProviderProps) => (
  <QueryClientProvider client={tiFQueryClient}>{children}</QueryClientProvider>
)
