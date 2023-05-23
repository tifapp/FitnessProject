import { z } from "zod"
import { createApiClient } from "./api-client"
import { GenericApiClient } from "./api-endpoint-types"

const ApiSchema = {
  "/users/{userId}": {
    GET: {
      pathParamsType: z.object({ userId: z.string() }),
      queryParamsType: z.object({ includePosts: z.number().int() }),
      responseType: z.object({ user: z.string() })
    }
  },
  "/posts": {
    POST: {
      payloadType: z.object({ title: z.string(), content: z.string() }),
      responseType: z.null()
    }
  }
}

type ApiClient = GenericApiClient<typeof ApiSchema>

describe("createApiClient", () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("calls the GET API with the correct method, endpoint, headers, and path params", async () => {
    const apiClient: ApiClient = createApiClient(
      ApiSchema,
      "https://example.com",
      global.fetch
    )

    await apiClient["/users/{userId}"].GET({
      pathParams: { userId: "1" },
      queryParams: { includePosts: 1 }
    })

    expect(global.fetch).toHaveBeenCalledWith(
      "https://example.com/users/1?includePosts=1",
      {
        headers: { "Content-Type": "application/json" },
        method: "GET"
      }
    )
  })

  it("calls the POST API with the correct method, endpoint, headers, and payload", async () => {
    const apiClient: ApiClient = createApiClient(
      ApiSchema,
      "https://example.com",
      global.fetch
    )

    await apiClient["/posts"].POST({
      payload: { title: "Test title", content: "Test content" }
    })

    expect(global.fetch).toHaveBeenCalledWith("https://example.com/posts?", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title: "Test title", content: "Test content" })
    })
  })

  it("handles ok response correctly with body", async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ body: { user: "John Doe" } })
    })

    const apiClient: ApiClient = createApiClient(
      ApiSchema,
      "https://example.com",
      mockFetch
    )

    const data = await apiClient["/users/{userId}"].GET({
      pathParams: { userId: "1" },
      queryParams: { includePosts: 1 }
    })

    expect(data).toEqual({ user: "John Doe" })
  })

  it("handles ok response correctly without body", async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 204 })
    })

    const apiClient: ApiClient = createApiClient(
      ApiSchema,
      "https://example.com",
      mockFetch
    )

    const data = await apiClient["/posts"].POST({
      payload: { title: "Test title", content: "Test content" }
    })

    expect(data).toEqual(null)
  })

  it("handles error response correctly", async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ body: "Internal Server Error" })
    })

    const apiClient: ApiClient = createApiClient(
      ApiSchema,
      "https://example.com",
      mockFetch
    )

    try {
      await apiClient["/posts"].POST({
        payload: { title: "Test title", content: "Test content" }
      })
    } catch (error) {
      expect(error).toEqual({ status: 500, message: "Internal Server Error" })
    }
  })

  it("handles network error correctly", async () => {
    const mockFetch = jest
      .fn()
      .mockRejectedValue(new Error("Failed to connect"))

    const apiClient: ApiClient = createApiClient(
      ApiSchema,
      "https://example.com",
      mockFetch
    )

    try {
      await apiClient["/users/{userId}"].GET({
        pathParams: { userId: "1" },
        queryParams: { includePosts: 1 }
      })
    } catch (error) {
      expect(error).toEqual({
        status: "Network error",
        message: "Failed to connect"
      })
    }
  })
})
