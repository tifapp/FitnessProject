import { RoswaalTestCase } from "./TestCase"

describe("RoswaalTestCases tests", () => {
  it("should run all steps and report all actions successful when no errors occur", async () => {
    const testCase = new RoswaalTestCase(
      "Test",
      jest.fn().mockResolvedValueOnce({})
    )
    testCase.appendAction(jest.fn())
    testCase.appendAction(jest.fn())
    const result = await testCase.run(jest.fn())
    expect(result).toEqual({
      testName: "Test",
      commandFailureOrdinal: null,
      error: null
    })
  })

  it("should report errors for all future actions after an action failure", async () => {
    const testCase = new RoswaalTestCase(
      "Test",
      jest.fn().mockResolvedValueOnce({})
    )
    testCase.appendAction(jest.fn())
    testCase.appendAction(jest.fn().mockRejectedValueOnce(new Error("I died")))
    testCase.appendAction(jest.fn())
    const result = await testCase.run(jest.fn())
    expect(result).toEqual({
      testName: "Test",
      commandFailureOrdinal: 2,
      error: new Error("I died")
    })
  })

  it("should report errors for all actions after a before launch failure", async () => {
    const testCase = new RoswaalTestCase(
      "Test",
      jest.fn().mockRejectedValueOnce(new Error("I died"))
    )
    testCase.appendAction(jest.fn())
    testCase.appendAction(jest.fn())
    const result = await testCase.run(jest.fn())
    expect(result).toEqual({
      testName: "Test",
      commandFailureOrdinal: 0,
      error: new Error("I died")
    })
  })
})
