import { mswServer, noContentResponse } from "@test-helpers/msw"
import { RoswaalClient, RoswaalClientUploadResults } from "./Client"
import { RoswaalTestCase } from "./TestCase"
import { http } from "msw"

describe("RoswaalClient tests", () => {
  const TEST_UPLOAD_RESULTS_PATH = "https://localhost:8082/api/results"
  let uploadedResults = [] as RoswaalClientUploadResults[]
  beforeEach(() => {
    uploadedResults = []
    mswServer.use(
      http.post(TEST_UPLOAD_RESULTS_PATH, async ({ request }) => {
        const body = (await request.json()) as {
          results: RoswaalClientUploadResults[]
        }
        uploadedResults = body.results
        return noContentResponse()
      })
    )
  })

  it("should upload test results", async () => {
    const client = new RoswaalClient(TEST_UPLOAD_RESULTS_PATH)
    const testCase1 = new RoswaalTestCase(
      "Hello",
      jest.fn().mockResolvedValueOnce({})
    )
    testCase1.appendAction(jest.fn())
    await client.run(testCase1, jest.fn())

    const testCase2 = new RoswaalTestCase(
      "World",
      jest.fn().mockResolvedValueOnce({})
    )
    testCase2.appendAction(jest.fn())
    await client.run(testCase2, jest.fn())
    await client.upload()
    expect(uploadedResults).toEqual([
      {
        name: "Hello",
        actionResults: [{ didPass: true }, { didPass: true }],
        error: null
      },
      {
        name: "World",
        actionResults: [{ didPass: true }, { didPass: true }],
        error: null
      }
    ])
  })

  it("should throw an error, but still add the result when the test case fails", async () => {
    const client = new RoswaalClient(TEST_UPLOAD_RESULTS_PATH)
    const testCase = new RoswaalTestCase(
      "Hello",
      jest.fn().mockResolvedValueOnce({})
    )
    testCase.appendAction(jest.fn().mockRejectedValueOnce(new Error("I died")))
    await expect(client.run(testCase, jest.fn())).rejects.toThrow(
      new Error("I died")
    )
    await client.upload()
    expect(uploadedResults).toEqual(
      expect.arrayContaining([
        {
          name: "Hello",
          actionResults: [{ didPass: true }, { didPass: false }],
          error: {
            message: "I died",
            stackTrace: expect.any(String)
          }
        }
      ])
    )
  })

  it("should not upload any results when no upload path is specified", async () => {
    const client = new RoswaalClient()
    const testCase = new RoswaalTestCase(
      "Hello",
      jest.fn().mockResolvedValueOnce({})
    )
    testCase.appendAction(jest.fn())
    client.run(testCase, jest.fn())
    await client.upload()
    expect(uploadedResults).toEqual([])
  })
})
