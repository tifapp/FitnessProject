import { JSONSerializableValue } from "@lib/JSONSerializable"
import { createLogFunction } from "@lib/Logging"
import { ToStringable } from "@lib/String"
import { AnyZodObject, z } from "zod"

export type TiFHTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

type BaseTiFAPIRequest<Method extends TiFHTTPMethod> = {
  method: Method
  endpoint: `/${string}`
  query?: { [key: string]: ToStringable }
}

/**
 * A type defining an API request to the backend.
 */
export type TiFAPIRequest<Method extends TiFHTTPMethod> = Method extends "GET"
  ? BaseTiFAPIRequest<Method>
  : BaseTiFAPIRequest<Method> & {
      body?: { [key: string]: JSONSerializableValue }
    }

type TiFAPIStatusCodeKey = `status${number}`

/**
 * A type mapping a zod schema to an http status code. The keys of the object
 * must be in the form `statusXXX`.
 */
export type TiFAPIResponseSchemas = {
  [key: TiFAPIStatusCodeKey]: AnyZodObject
}

type StatusCodeMap = {
  status200: 200
  status201: 201
  status204: 204
  status400: 400
  status401: 401
  status403: 403
  status404: 404
  status429: 429
  status500: 500
}

type TiFAPIResponseObject<
  Status extends number,
  Schema extends AnyZodObject
> = {
  status: Status
  data: z.infer<Schema>
}

/**
 * A union type mapping a status code to the infered type of a ZodSchema.
 */
export type TiFAPIResponse<Schemas extends TiFAPIResponseSchemas> = {
  [key in keyof StatusCodeMap]: TiFAPIResponseObject<
    StatusCodeMap[key],
    Schemas[key]
  >
}[keyof StatusCodeMap]

const log = createLogFunction("tif.api.client")

/**
 * Creates a fetch function to fetch from the backend.
 *
 * ```ts
 * const apiFetch = createTiFAPIFetch(
      TEST_BASE_URL,
      () => TEST_JWT
    )

    const ResponseSchema = {
      status400: z.object({ b: z.string() }),
      status200: z.object({ a: z.number() })
    }

    const resp = await apiFetch(
      {
        method: "POST",
        endpoint: "/test",
        query: { hello: "world", a: 1 },
        body: { a: 1, b: "hello" }
      },
      ResponseSchema
    )

    if (resp.status === 200) {
      console.log(resp.data.a) // a is inferred to be a number.
    }
 * ```
 *
 * @param baseUrl the base url of the backend to use.
 * @param loadAuthBearerToken a function that returns the loaded JWT.
 * @returns a function to make an API call.
 */
export const createTiFAPIFetch = (
  baseUrl: URL,
  loadAuthBearerToken: () => Promise<string | undefined>
) => {
  return async <
    Method extends TiFHTTPMethod,
    Schemas extends TiFAPIResponseSchemas
  >(
    request: TiFAPIRequest<Method>,
    responseSchemas: Schemas
  ): Promise<TiFAPIResponse<Schemas>> => {
    try {
      const token = await loadAuthBearerToken()
      const searchParams = queryToSearchParams(request.query ?? {})
      const url = `${baseUrl}${request.endpoint.slice(1)}?${searchParams}`
      const resp = await fetch(url, {
        method: request.method,
        headers: {
          Authorization: `Bearer ${token}`,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          "Content-Type": "application/json"
        },
        body:
          request.method === "GET" ? undefined : JSON.stringify(request.body)
      })
      const json = await resp.json()
      return {
        status: resp.status as any,
        data: await responseSchemas[`status${resp.status}`].parseAsync(json)
      }
    } catch (error) {
      log("error", "Failed to make tif API request.", {
        error,
        errorMessage: error.message
      })
      throw error
    }
  }
}

const queryToSearchParams = (query: { [key: string]: ToStringable }) => {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    params.set(key, value.toString())
  }
  return params
}
