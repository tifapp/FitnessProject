import { MultiplexedError } from "@lib/MultiplexedError"

describe("MultiplexedError tests", () => {
  it("separates all error messages from the errors with the given separator", () => {
    const e1 = new Error("test1")
    const e2 = new Error("test2")
    const error = new MultiplexedError([e1, e2], "+")
    expect(error.message).toEqual("test1+test2")
  })
})
