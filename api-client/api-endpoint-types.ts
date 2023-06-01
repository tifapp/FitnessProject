import { ZodType } from "zod"
import { ApiSchema } from "./api-schema"

export type ApiErrorType = { [Status in number]: ZodType<any> }

export type Method = "GET" | "PUT" | "POST" | "PATCH" | "DELETE"

export type Endpoint = {
  [K: string]: {
    [M in Method]?: {
      payloadType?: ZodType<any>
      queryParamsType?: ZodType<any>
      pathParamsType?: ZodType<any>
      responseType: ZodType<any>
      errorType?: ApiErrorType
    }
  }
}

export type GenericApiSchema<T extends Endpoint> = T

export type GenericApiClient<S extends GenericApiSchema<any>> = {
  [K in keyof S]: S[K] extends {
    [M in Method]?: {
      payloadType?: ZodType<any>
      queryParamsType?: ZodType<any>
      pathParamsType?: ZodType<any>
      responseType: ZodType<infer O>
    }
  }
    ? {
        [M in keyof S[K]]: (
          args: (S[K][M] extends { payloadType: ZodType<infer P> }
            ? { payload: P }
            : {}) &
            (S[K][M] extends { queryParamsType: ZodType<infer Q> }
              ? { queryParams: Q }
              : {}) &
            (S[K][M] extends { pathParamsType: ZodType<infer R> }
              ? { pathParams: R }
              : {})
        ) => Promise<O>
      }
    : never
}

export type ApiClient = GenericApiClient<GenericApiSchema<typeof ApiSchema>>
