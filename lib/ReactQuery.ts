import { UseQueryOptions } from "react-query"

// TODO: - React query module

/**
 * A helper type for creating custom hooks that wrap `useQuery`.
 */
export type QueryHookOptions<Data, Error = unknown> = Omit<
  UseQueryOptions<Data, Error, Data, string[]>,
  "queryKey" | "queryFn"
>
