import React, { ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "react-query"

const appQueryClient = new QueryClient()

export type AppQueryClientProviderProps = {
  children: ReactNode
}

/**
 * Default `QueryClientProvider` for the app.
 */
export const AppQueryClientProvider = ({
  children
}: AppQueryClientProviderProps) => (
  <QueryClientProvider client={appQueryClient}>{children}</QueryClientProvider>
)
