import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientConfig,
  QueryClientProvider,
  UseMutationOptions,
  UseQueryOptions,
  focusManager,
  onlineManager
} from "@tanstack/react-query"
import React, { ReactNode } from "react"
import { AppState } from "react-native"
import { InternetConnectionStatus } from "./InternetConnection"

/**
 * A helper type for creating custom hooks that wrap `useQuery`.
 */
export type QueryHookOptions<Data, Error = unknown> = Omit<
  UseQueryOptions<Data, Error, Data>,
  "queryKey" | "queryFn"
>

/**
 * A helper type for making hooks that wrap {@link useMutation}.
 */
export type MutationHookOptions<
  Data,
  Args,
  Error = unknown,
  Context = unknown
> = Omit<UseMutationOptions<Data, Error, Args, Context>, "mutationFn">

const logErrorIfPresent = (
  error: Error,
  metaHolder: { meta?: Record<string, unknown> },
  message: string
) => {
  const log = metaHolder.meta?.log
  if (
    log &&
    typeof log === "object" &&
    "error" in log &&
    log.error instanceof Function
  ) {
    log.error(message, { error, message: error.message })
  }
}

export const TIF_BASE_QUERY_CLIENT_CONFIG = {
  queryCache: new QueryCache({
    onError: (error, query) => {
      logErrorIfPresent(error, query, "A query threw an error.")
    }
  }),
  mutationCache: new MutationCache({
    onError: (error, _, __, mutation) => {
      logErrorIfPresent(error, mutation, "A mutation threw an error.")
    }
  })
} satisfies QueryClientConfig

/**
 * The singleton query client to use for the app.
 */
export const tiFQueryClient = new QueryClient(TIF_BASE_QUERY_CLIENT_CONFIG)

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

/**
 * Synchronizes the state of the given {@link InternetConnectionStatus} to
 * react-query's {@link onlineManager}.
 *
 * This effectively means that any `useQuery` will automatically refetch its
 * data when the user's internet connection comes back online.
 */
export const setupInternetReconnectionRefreshes = (
  internetConnectionStatus: InternetConnectionStatus
) => {
  internetConnectionStatus.subscribe((isConnected) => {
    onlineManager.setOnline(isConnected)
  })
}

/**
 * Synchronizes the current {@link AppStateStatus} with react-query's
 * {@link focusManager}.
 *
 * This effectively means that any `useQuery` will automatically refetch its
 * data when the app is focused after being backgrounded.
 */
export const setupFocusRefreshes = () => {
  AppState.addEventListener("change", (status) => {
    focusManager.setFocused(status === "active")
  })
}
