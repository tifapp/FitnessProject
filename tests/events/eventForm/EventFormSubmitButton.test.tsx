import { neverPromise } from "../../helpers/Promise"

const submitAction = jest.fn()

describe("EventFormSubmitButton tests", () => {
  it("should be in a disable state while submitting", () => {
    submitAction.mockImplementation(neverPromise)
  })
})
