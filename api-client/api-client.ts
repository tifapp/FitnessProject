import {
  ApiClient,
  GenericApiClient,
  GenericApiSchema,
  Method
} from "./api-endpoint-types"
import { ApiSchema } from "./api-schema"

const baseUrl = ""

async function fetchApi<K extends keyof ApiClient> (
  key: K,
  method: Method,
  payload?: Parameters<ApiClient[K]>[0]["payload"],
  queryParams?: Parameters<ApiClient[K]>[0]["queryParams"],
  pathParams?: Parameters<ApiClient[K]>[0]["pathParams"]
): Promise<ReturnType<ApiClient[K]>> {
  const apiMethod = (ApiSchema[key] as any)[method]

  if (!apiMethod) {
    throw new Error(`Invalid method '${method}' for endpoint '${key}'`)
  }

  const { payloadType, queryParamsType, pathParamsType, responseType } =
    apiMethod
  payloadType?.parse(payload)
  queryParamsType?.parse(queryParams)
  pathParamsType?.parse(pathParams)

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

  const response = await fetch(
    `${baseUrl}${parsedUrl}?${new URLSearchParams(queryParams)}`,
    requestOptions
  )

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const data = await response.json()
  return responseType.parse(data)
}

function createApiClient<S extends GenericApiSchema<any>> (
  schema: S
): GenericApiClient<S> {
  const client: any = {}

  for (const key in schema) {
    for (const method in schema[key]) {
      client[key] = async (payload: any) => {
        return await fetchApi(key as keyof ApiClient, method as Method, payload)
      }
    }
  }

  return client
}

export const client: ApiClient = createApiClient(ApiSchema)
