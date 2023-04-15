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
 * Props for `TestQueryClientProvider`.
 */
export type TestQueryClientProviderProps = {
  children: ReactNode

  /**
   * Use this if you need to pass in a custom query client.
   * (Eg. if you need to test some retry behavior)
   *
   * Any custom query client will automatically be reset when
   * `TestQueryClientProvider` mounts.
   */
  client?: QueryClient
}

/**
 * Use this when testing components that use react query.
 */
export const TestQueryClientProvider = ({
  children,
  client
}: TestQueryClientProviderProps) => {
  // NB: Ensure each test has a fresh query client so that tests don't depend
  // on each other.
  // See: https://react-query-v3.tanstack.com/guides/testing#our-first-test
  const queryClient = useMemo(() => {
    if (client) return client
    return createTestQueryClient()
  }, [client])

  useEffect(() => {
    queryClient.resetQueries()
    return () => queryClient.clear()
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
