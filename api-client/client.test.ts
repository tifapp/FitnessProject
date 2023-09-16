import { z } from "zod"
import { createTiFAPIFetch } from "./client"
import { rest } from "msw"
import fetch, { Request, Response } from "node-fetch"
import { setupServer } from "msw/node"

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
  })
)

server.listen()

describe("createAPIFetch tests", () => {
  test("api client fetch", async () => {
    const apiFetch = createTiFAPIFetch(
      TEST_BASE_URL,
      jest.fn().mockResolvedValue(TEST_JWT)
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

    expect(resp).toMatchObject({
      status: 200,
      data: { a: 1 }
    })
  })
})
