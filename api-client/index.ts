import { API_URL } from "env"
import { createApiClient } from "./api-client"
import { ApiClient } from "./api-endpoint-types"
import { ApiSchema } from "./api-schema"
import { fetchWithAuth } from "./aws-fetch"


/**
 * apiClient is an instance of the generated API client based on the provided ApiSchema
 * It allows making requests to the API endpoints defined in the schema using the provided fetchApi
 *
 * The apiClient can be used using the following syntax:
 * apiClient[path][method](params)
 *
 * - `path`: A string representing the API endpoint (e.g., "/user")
 * - `method`: An HTTP method as a string (e.g., "GET", "POST", "PUT", "DELETE")
 * - `params`: An object containing request parameters:
 *   - `payload`: The request body, if applicable
 *   - `queryParams`: An object containing query parameters, if applicable
 *   - `pathParams`: An object containing path parameters, if applicable
 *
 * Example usage:
 *   const response = await apiClient["/user"]["GET"]({ queryParams: { id: 1 } });
 *
 * @type {ApiClient}
 */
export const apiClient: ApiClient = createApiClient(
  ApiSchema,
  API_URL ?? "",
  fetchWithAuth
)
