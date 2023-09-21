import { UseMutationOptions, UseQueryOptions } from "@tanstack/react-query"

// TODO: - React query module

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
