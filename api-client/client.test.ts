import { HttpResponse, http } from "msw"
import { z } from "zod"
import { neverPromise } from "../test-helpers/Promise"
import { mswServer } from "../test-helpers/msw"
import { createTiFAPIFetch } from "./client"

const TEST_BASE_URL = new URL("http://localhost:8080")

const TEST_JWT = "this is a totally a JWT"

const apiFetch = createTiFAPIFetch(
  TEST_BASE_URL,
  jest.fn().mockResolvedValue(TEST_JWT)
)

const TestResponseSchema = {
  status400: z.object({ b: z.string() }),
  status200: z.object({ a: z.number() })
}

describe("CreateAPIFetch tests", () => {
  beforeEach(() => {
    mswServer.use(
      http.post("http://localhost:8080/test", async ({ request }) => {
        const errorResp = new HttpResponse(JSON.stringify({ a: 1 }), {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        })
        const body: any = await request.json()

        if (request.headers.get("Authorization") !== `Bearer ${TEST_JWT}`) {
          console.log("invalid token")
          return errorResp
        }
        if (
          new URLSearchParams(request.url).get("hello") !== "world" ||
          new URLSearchParams(request.url).get("a") !== "1"
        ) {
          return errorResp
        }

        if (body?.a !== 1 || body?.b !== "hello") {
          return errorResp
        }
        return new HttpResponse(JSON.stringify({ a: 1 }), {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        })
      }),
      http.get("http://localhost:8080/test2", async ({ request }) => {
        try {
          await request.json()
          return new HttpResponse(JSON.stringify({ b: "bad" }), {
            status: 500,
            headers: {
              "Content-Type": "application/json"
            }
          })
        } catch {
          return new HttpResponse(JSON.stringify({ a: 1 }), {
            status: 200,
            headers: {
              "Content-Type": "application/json"
            }
          })
        }
      }),
      http.get("http://localhost:8080/test3", async () => {
        return new HttpResponse(JSON.stringify({ b: "bad" }), {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        })
      }),
      http.get("http://localhost:8080/test4", async () => {
        return new HttpResponse("LMAO", {
          status: 200
        })
      }),
      http.get("http://localhost:8080/test5", async () => {
        return new HttpResponse(JSON.stringify({ b: "bad" }), {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        })
      }),
      http.get("http://localhost:8080/test6", async () => {
        return new HttpResponse(null, {
          status: 204
        })
      }),
      http.get("http://localhost:8080/test7", async () => {
        await neverPromise()
        return new HttpResponse(null, {
          status: 500
        })
      }),
      http.get("http://localhost:8080/test8", async ({ request }) => {
        if (new URLSearchParams(request.url).has("hello")) {
          return new HttpResponse(null, {
            status: 500
          })
        }
        return new HttpResponse(JSON.stringify({ a: 1 }), {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        })
      })
    )
  })

  test("api client fetch", async () => {
    const resp = await apiFetch(
      {
        method: "POST",
        endpoint: "/test",
        query: { hello: "world", a: 1 },
        body: { a: 1, b: "hello" }
      },
      TestResponseSchema
    )

    expect(resp).toMatchObject({
      status: 200,
      data: { a: 1 }
    })
  })

  test("api client fetch, undefined query", async () => {
    const resp = await apiFetch(
      {
        method: "GET",
        endpoint: "/test8",
        query: { hello: undefined }
      },
      TestResponseSchema
    )

    expect(resp).toMatchObject({
      status: 200,
      data: { a: 1 }
    })
  })

  test("api client fetch, no body", async () => {
    const resp = await apiFetch(
      {
        method: "GET",
        endpoint: "/test2"
      },
      TestResponseSchema
    )

    expect(resp).toMatchObject({
      status: 200,
      data: { a: 1 }
    })
  })

  test("api client fetch, response code not in schema", async () => {
    expect(
      apiFetch(
        {
          method: "GET",
          endpoint: "/test3"
        },
        TestResponseSchema
      )
    ).rejects.toEqual(
      new Error(
        "TiF API responded with an unexpected status code 500 and body {\"b\":\"bad\"}"
      )
    )
  })

  test("api client fetch, json not returned from API", async () => {
    expect(
      apiFetch(
        {
          method: "GET",
          endpoint: "/test4"
        },
        TestResponseSchema
      )
    ).rejects.toEqual(
      new Error("TiF API responded with non-JSON body and status 200.")
    )
  })

  test("api client fetch, invalid json returned from API", async () => {
    expect(
      apiFetch(
        {
          method: "GET",
          endpoint: "/test5"
        },
        TestResponseSchema
      )
    ).rejects.toEqual(
      new Error(
        "TiF API responded with an invalid JSON body {\"b\":\"bad\"} and status 200."
      )
    )
  })

  test("api client fetch, empty body on 204, response schema doesn't list a 204 response", async () => {
    expect(
      apiFetch(
        {
          method: "GET",
          endpoint: "/test6"
        },
        TestResponseSchema
      )
    ).rejects.toEqual(
      new Error(
        "TiF API responded with an unexpected status code 204 and body \"\""
      )
    )
  })

  test("api client fetch, empty body on 204, response schema lists a 204 response", async () => {
    const resp = await apiFetch(
      {
        method: "GET",
        endpoint: "/test6"
      },
      { ...TestResponseSchema, status204: "no-content" }
    )

    expect(resp.data).toMatchObject({})
  })

  test("cancellation", async () => {
    const controller = new AbortController()
    const respPromise = apiFetch(
      {
        method: "GET",
        endpoint: "/test7"
      },
      TestResponseSchema,
      controller.signal
    )

    controller.abort()

    expect(respPromise).rejects.toBeInstanceOf(Error)
  })
})
