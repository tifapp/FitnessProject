import { UseQueryOptions } from "@tanstack/react-query"

// TODO: - React query module

/**
 * A helper type for creating custom hooks that wrap `useQuery`.
 */
export type QueryHookOptions<Data> = Omit<
  UseQueryOptions<Data, unknown, Data, string[]>,
  "queryKey" | "queryFn"
>
