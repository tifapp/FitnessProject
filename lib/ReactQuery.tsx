import {
  QueryClient,
  QueryClientProvider,
  UseMutationOptions,
  UseQueryOptions
} from "@tanstack/react-query"
import React, { ReactNode } from "react"

/**
 * A helper type for creating custom hooks that wrap `useQuery`.
 */
export type QueryHookOptions<Data, Error = unknown> = Omit<
  UseQueryOptions<Data, Error, Data, string[]>,
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
