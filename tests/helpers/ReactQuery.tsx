import React, { ReactNode, useMemo } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

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
        retryDelay: 0,
        // NB: This prevents CI from hanging endlessly.
        cacheTime: Infinity
      },
      mutations: {
        cacheTime: Infinity,
        retry: false
      }
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: process.env.NODE_ENV === "test" ? () => {} : console.error
    }
  })
}

/**
 * Props for `TestQueryClientProvider`.
 */
export type TestQueryClientProviderProps = {
  children: ReactNode
  client?: QueryClient
}

/**
 * Use this when testing components that use react query.
 */
export const TestQueryClientProvider = ({
  children,
  client
}: TestQueryClientProviderProps) => {
  const queryClient = useMemo(() => {
    if (client) return client
    return createTestQueryClient()
  }, [client])

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
