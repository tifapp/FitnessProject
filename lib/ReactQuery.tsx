import {
  QueryClient,
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

/**
 * The singleton query client to use for the app.
 */
export const tiFQueryClient = new QueryClient()

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
