import { AmplifyGraphQLClient, GraphQLClientError } from "@lib/GraphQLClient"
import API from "@aws-amplify/api"
import { GraphQLError } from "graphql"
import { GraphQLOptions } from "@aws-amplify/api-graphql"
import { neverPromise } from "./helpers/Promise"

jest.mock("@aws-amplify/api")

const testStatement = /* GraphQL */ `
  query DoTest($val: TestVal) {
    doTest(val: $val) {
      a
      b
      c
      d
    }
  }
`
const testVariables = { val: { a: "a", b: "b" } }
const testReturnData = 1
const testAmplifyGraphQLError = new GraphQLError("failed")

const operations = new AmplifyGraphQLClient()

describe("AmplifyGraphQLOperations tests", () => {
  test("execute encodes proper request with variables", async () => {
    let encodedRequest: GraphQLOptions | undefined
    API.graphql = jest.fn().mockImplementation((request: GraphQLOptions) => {
      encodedRequest = request
      return { data: testReturnData }
    })

    await operations.execute(testStatement, testVariables).value
    expect(encodedRequest).toMatchObject({
      query: testStatement,
      variables: testVariables
    })
  })

  test("awaits current value", async () => {
    API.graphql = jest.fn().mockResolvedValue({
      data: testReturnData
    })
    expect(await operations.execute(testStatement).value).toEqual(
      testReturnData
    )
  })

  test("execute encodes proper request without variables", async () => {
    let encodedRequest: GraphQLOptions | undefined
    API.graphql = jest.fn().mockImplementation((request: GraphQLOptions) => {
      encodedRequest = request
      return { data: testReturnData }
    })

    await operations.execute(testStatement).value
    expect(encodedRequest).toMatchObject({
      query: testStatement
    })
  })

  test("execute throws errors with the proper data", async () => {
    API.graphql = jest.fn().mockResolvedValue({
      data: testReturnData,
      errors: [testAmplifyGraphQLError]
    })

    expect(
      async () => await operations.execute(testStatement).value
    ).rejects.toThrowError(
      new GraphQLClientError({
        data: testReturnData,
        errors: [testAmplifyGraphQLError]
      })
    )
  })

  test("that a promise from execute can be cancelled properly", async () => {
    API.cancel = jest.fn()
    API.graphql = jest.fn().mockImplementation(async () => await neverPromise())

    const cancellablePromise = operations.execute(testStatement)
    cancellablePromise.cancel()

    expect(API.cancel).toHaveBeenCalled()
  })
})
