import { AmplifyGraphQLClient, GraphQLClientError } from "@lib/GraphQLClient"
import API from "@aws-amplify/api"
import { GraphQLError } from "graphql"
import { GraphQLOptions } from "@aws-amplify/api-graphql"

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

    await operations.execute(testStatement, testVariables)
    expect(encodedRequest).toMatchObject({
      query: testStatement,
      variables: testVariables
    })
  })

  test("execute encodes proper request without variables", async () => {
    let encodedRequest: GraphQLOptions | undefined
    API.graphql = jest.fn().mockImplementation((request: GraphQLOptions) => {
      encodedRequest = request
      return { data: testReturnData }
    })

    await operations.execute(testStatement)
    expect(encodedRequest).toMatchObject({
      query: testStatement
    })
  })

  test("execute throws errors with the proper data", async () => {
    try {
      API.graphql = jest.fn().mockResolvedValue({
        data: testReturnData,
        errors: [testAmplifyGraphQLError]
      })

      await operations.execute(testStatement)
      fail("this should throw an error")
    } catch (e: unknown) {
      expect(e).toMatchObject(
        new GraphQLClientError({
          data: testReturnData,
          errors: [testAmplifyGraphQLError]
        })
      )
    }
  })
})
