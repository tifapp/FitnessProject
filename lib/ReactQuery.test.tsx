import {
  MutationObserver,
  QueryClient,
  QueryObserver
} from "@tanstack/react-query"
import { addLogHandler, logger, resetLogHandlers } from "TiFShared/logging"
import { TIF_BASE_QUERY_CLIENT_CONFIG } from "./ReactQuery"

describe("ReactQuery tests", () => {
  const handler = jest.fn()

  beforeEach(() => {
    handler.mockReset()
    addLogHandler(handler)
  })
  afterEach(() => resetLogHandlers())

  it("should log errors globally with the log handler", async () => {
    const client = new QueryClient(TIF_BASE_QUERY_CLIENT_CONFIG)
    const log = logger("react.query.test")
    const error = new Error("Test error")
    const observer = new QueryObserver(client, {
      queryKey: ["test"],
      queryFn: async () => {
        throw error
      },
      enabled: false,
      retry: 0,
      meta: { log }
    })
    await observer.refetch()
    expect(handler).toHaveBeenCalledWith(
      "react.query.test",
      "error",
      "A query threw an error.",
      { error, message: error.message }
    )
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it("should log mutation errors globally with the log handler", async () => {
    const client = new QueryClient(TIF_BASE_QUERY_CLIENT_CONFIG)
    const log = logger("react.query.test")
    const error = new Error("Test error")
    const observer = new MutationObserver(client, {
      mutationFn: async () => {
        throw error
      },
      meta: { log }
    })
    await expect(observer.mutate()).rejects.toThrow()
    expect(handler).toHaveBeenCalledWith(
      "react.query.test",
      "error",
      "A mutation threw an error.",
      { error, message: error.message }
    )
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it("should not log non-throwing queries", async () => {
    const client = new QueryClient(TIF_BASE_QUERY_CLIENT_CONFIG)
    const log = logger("react.query.test")
    const observer = new QueryObserver(client, {
      queryKey: ["test"],
      queryFn: async () => 1,
      enabled: false,
      meta: { log }
    })
    await observer.refetch()
    expect(handler).not.toHaveBeenCalled()
  })

  it("should not log non-throwing mutations", async () => {
    const client = new QueryClient(TIF_BASE_QUERY_CLIENT_CONFIG)
    const log = logger("react.query.test")
    const observer = new MutationObserver(client, {
      mutationFn: async () => 1,
      meta: { log }
    })
    await observer.mutate()
    expect(handler).not.toHaveBeenCalled()
  })
})
