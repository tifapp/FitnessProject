import { ZodType } from "zod"
import { ApiSchema } from "./api-schema"

export type Method = "GET" | "PUT" | "POST" | "PATCH" | "DELETE"

interface ApiEndpoint {
  payloadType?: ZodType<any>
  queryParamsType?: ZodType<any>
  pathParamsType?: ZodType<any>
  responseType: ZodType<any>
}

export type GenericApiSchema<
  T extends {
    [K in keyof T]: {
      [M in Method]?: ApiEndpoint
    }
  }
> = T

type ApiEndpointFunction<K, P, Q, R, O> = ({
  path,
  payload,
  queryParams,
  pathParams
}: {
  path: K
  payload: P extends ZodType<any> ? P : undefined
  queryParams: Q extends ZodType<any> ? Q : undefined
  pathParams: R extends ZodType<any> ? R : undefined
}) => Promise<O>

export type GenericApiClient<S extends GenericApiSchema<any>> = {
  [K in keyof S]: S[K] extends {
    [M in Method]?: {
      payloadType?: ZodType<infer P>
      queryParamsType?: ZodType<infer Q>
      pathParamsType?: ZodType<infer R>
      responseType: ZodType<infer O>
    }
  }
    ? ApiEndpointFunction<K, P, Q, R, O>
    : never
}

export type ApiClient = GenericApiClient<GenericApiSchema<typeof ApiSchema>>
