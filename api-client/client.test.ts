import { z } from "zod"
import { createTiFAPIFetch } from "./client"
import { rest } from "msw"
import fetch, { Request, Response } from "node-fetch"
import { setupServer } from "msw/node"
import { neverPromise } from "../tests/helpers/Promise"

globalThis.fetch = fetch as any
globalThis.Request = Request as any
globalThis.Response = Response as any

const TEST_BASE_URL = new URL("http://localhost:8080")

const TEST_JWT = "this is a totally a JWT"

const server = setupServer(
  rest.post("http://localhost:8080/test", async (req, res, ctx) => {
    const errorResp = res(ctx.status(400), ctx.json({ b: "bad request" }))
    const body = await req.json()

    if (req.headers.get("Authorization") !== `Bearer ${TEST_JWT}`) {
      console.log("invalid token")
      return errorResp
    }
    if (
      req.url.searchParams.get("hello") !== "world" ||
      req.url.searchParams.get("a") !== "1"
    ) {
      return errorResp
    }

    if (body.a !== 1 || body.b !== "hello") {
      return errorResp
    }
    return res(ctx.status(200), ctx.json({ a: 1 }))
  }),
  rest.get("http://localhost:8080/test2", async (req, res, ctx) => {
    try {
      await req.json()
      return res(ctx.status(500), ctx.json({ b: "bad" }))
    } catch {
      return res(ctx.status(200), ctx.json({ a: 1 }))
    }
  }),
  rest.get("http://localhost:8080/test3", async (_, res, ctx) => {
    return res(ctx.status(500), ctx.json({ b: "bad" }))
  }),
  rest.get("http://localhost:8080/test4", async (_, res, ctx) => {
    return res(ctx.status(200), ctx.text("LMAO"))
  }),
  rest.get("http://localhost:8080/test5", async (_, res, ctx) => {
    return res(ctx.status(200), ctx.json({ b: "bad" }))
  }),
  rest.get("http://localhost:8080/test6", async (_, res, ctx) => {
    return res(ctx.status(204))
  }),
  rest.get("http://localhost:8080/test7", async (_, res, ctx) => {
    await neverPromise()
    return res(ctx.status(500))
  })
)

const apiFetch = createTiFAPIFetch(
  TEST_BASE_URL,
  jest.fn().mockResolvedValue(TEST_JWT)
)

const TestResponseSchema = {
  status400: z.object({ b: z.string() }),
  status200: z.object({ a: z.number() })
}

server.listen()

describe("CreateAPIFetch tests", () => {
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
