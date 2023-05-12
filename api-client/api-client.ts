import { z, ZodType } from "zod"
import {
  ApiClient,
  ApiError,
  GenericApiClient,
  GenericApiSchema,
  Method
} from "./api-endpoint-types"

const endpointFunction = async <K extends keyof ApiClient, M extends Method>(
  baseUrl: string,
  fetchApi: typeof fetch,
  key: K,
  method: Method,
  responseType: ZodType<any>,
  payload?: any,
  queryParams?: any,
  pathParams?: any
): Promise<ReturnType<ApiClient[K][M]> | ApiError> => {
  const parsedUrl = pathParams
    ? Object.keys(pathParams).reduce(
      (accumulatedUrl, param) =>
        accumulatedUrl.replace(`{${param}}`, pathParams[param]),
      key
    )
    : key

  const requestOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  }

  try {
    const response = await fetchApi(
      `${baseUrl}${parsedUrl}?${new URLSearchParams(queryParams)}`,
      requestOptions
    )

    if (!response.ok) {
      const errorData = await response.json()
      return { status: response.status, message: errorData.body }
    }

    const data = await response.json()
    return responseType.parse(data.body ?? null)
  } catch (error) {
    return { status: "Network Error", message: error }
  }
}

export const createApiClient = <S extends GenericApiSchema<any>>(
  schema: S,
  baseUrl: string,
  fetchApi?: typeof fetch
): GenericApiClient<S> => {
  const client: any = {}

  for (const key in schema) {
    for (const method in schema[key]) {
      const apiMethod = (schema[key] as any)[method]

      if (!apiMethod) {
        throw new Error(`Invalid method '${method}' for endpoint '${key}'`)
      }

      const { payloadType, queryParamsType, pathParamsType, responseType } =
        apiMethod

      client[key] = {}
      client[key][method] = async ({
        payload,
        queryParams,
        pathParams
      }: {
        payload: z.infer<typeof payloadType>
        queryParams?: z.infer<typeof queryParamsType>
        pathParams?: z.infer<typeof pathParamsType>
      }) => {
        payloadType?.parse(payload)
        queryParamsType?.parse(queryParams)
        pathParamsType?.parse(pathParams)

        return await endpointFunction(
          baseUrl,
          fetchApi ?? fetch,
          key as keyof ApiClient,
          method as Method,
          responseType,
          payload,
          queryParams,
          pathParams
        )
      }
    }
  }

  return client
}
