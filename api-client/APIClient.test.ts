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
      responseType: z.object({ postId: z.string() })
    }
  }
}

type ApiClient = GenericApiClient<typeof ApiSchema>

describe("createApiClient", () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
    global.fetch = originalFetch
  })

  it("calls the API with the correct method, endpoint, headers, and path params", async () => {
    const apiClient: ApiClient = createApiClient(
      ApiSchema,
      "https://example.com",
      global.fetch
    )

    try {
      await apiClient["/users/{userId}"].GET({
        pathParams: { userId: "1" },
        queryParams: { includePosts: 1 }
      })
    } catch (e) {}

    expect(global.fetch).toHaveBeenCalledWith(
      "https://example.com/users/1?includePosts=1",
      expect.objectContaining({
        method: "GET"
      })
    )
  })

  it("calls the API with the correct method, endpoint, headers, and payload", async () => {
    const apiClient: ApiClient = createApiClient(
      ApiSchema,
      "https://example.com",
      global.fetch
    )

    try {
      await apiClient["/posts"].POST({
        payload: { title: "Test title", content: "Test content" }
      })
    } catch (e) {}

    expect(global.fetch).toHaveBeenCalledWith(
      "https://example.com/posts?",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ title: "Test title", content: "Test content" })
      })
    )
  })
})
