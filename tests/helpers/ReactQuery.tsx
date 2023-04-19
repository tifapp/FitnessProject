import React, { ReactNode, useEffect, useMemo } from "react"
import { QueryClient, QueryClientProvider } from "react-query"

/**
 * Creates a `QueryClient` suitable for testing.
 *
 * The test query client disables all retrying behavior to ensure that,
 * query functions don't get called more than once in tests.
 *
 * However, you may decide that you need to test something related to the
 * retry behavior, you can do this by manually enabling retries like so:
 *
 * ```ts
 * const queryClient = createTestQueryClient()
 * queryClient.setDefaultOptions({ ...queryClient.getDefaultOptions(), retry: true })
 * ```
 *
 * You will then need to pass your custom test query client to `TestQueryClientProvider`
 * as such:
 *
 * ```tsx
 * <TestQueryClientProvider client={queryClient}>
 *  {...}
 * </TestQueryClientProvider>
 * ```
 *
 * In the case of needing to test retries like the one above, the retry delay is also
 * set to 0 to ensure fast tests. It is highly recommended to not change that value.
 */
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // NB: Turn retries off so that we don't get unexepcted calls to queries in tests.
        // See: https://react-query-v3.tanstack.com/guides/testing#turn-off-retries
        retry: false,
        retryDelay: 0
      }
    }
  })
}

/**
 * Use this inside of an `afterAll` to make sure CI doesn't break.
 */
export const cleanupTestQueryClient = (client: QueryClient) => {
  client.resetQueries()
  client.clear()
}

/**
 * Props for `TestQueryClientProvider`.
 */
export type TestQueryClientProviderProps = {
  children: ReactNode
  client: QueryClient
}

/**
 * Use this when testing components that use react query.
 */
export const TestQueryClientProvider = ({
  children,
  client
}: TestQueryClientProviderProps) => {
  useEffect(() => {
    cleanupTestQueryClient(client)
  }, [client])

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
