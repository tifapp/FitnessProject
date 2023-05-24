import { ApiSchema } from "@api-client/api-schema"
import { apiClient } from "@api-client/index"
import { UseQueryOptions, UseQueryResult, useQuery } from "react-query"

type ApiPath = keyof typeof ApiSchema
type ApiMethod<P extends ApiPath> = keyof (typeof ApiSchema)[P]

type EndpointSchema<
  P extends ApiPath,
  M extends ApiMethod<P>
> = (typeof ApiSchema)[P][M]

// Helper types to extract errorType if it exists on EndpointSchema.
type ErrorField<T> = T extends { errorType: infer E } ? E : never

type ErrorType<T> = {
  [K in keyof T]: { status: K; error: T[K] }
}[keyof T]

type ApiError<P extends ApiPath, M extends ApiMethod<P>> = ErrorType<
  ErrorField<EndpointSchema<P, M>>
>

type ApiParams<P extends ApiPath, M extends ApiMethod<P>> = Parameters<
  (typeof apiClient)[P][M]
>[0]

type PromiseType<T> = T extends Promise<infer U> ? U : never
type ApiData<P extends ApiPath, M extends ApiMethod<P>> = PromiseType<
  ReturnType<(typeof apiClient)[P][M]>
>

export function useApiQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey = string[]
> (
  path: ApiPath,
  method: ApiMethod<typeof path>,
  params: ApiParams<typeof path, ApiMethod<typeof path>>,
  options?: UseQueryOptions<TQueryFnData, unknown, unknown, string[]>
): UseQueryResult<
  ApiData<typeof path, ApiMethod<typeof path>>,
  ApiError<typeof path, ApiMethod<typeof path>>
> {
  return useQuery<
    ApiData<typeof path, ApiMethod<typeof path>>,
    ApiError<typeof path, ApiMethod<typeof path>>,
    any,
    string[]
  >([`${path}`, `${method}`], () => apiClient[path][method](params), options)
}
