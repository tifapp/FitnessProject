import { GraphQLClient } from "@lib/GraphQLClient"
import { unimplemented } from "./unimplemented"

/**
 * A `GraphQLClient` instance that causes a test failure when any
 * of its methods are invoked.
 */
export const unimplementedGraphQLClient: GraphQLClient = {
  execute: () => unimplemented("execute")
} as const

/**
 * Helper to set a mock response for a given graphql statement.
 */
export const mockGraphQLResponseForStatement = <T>({
  statement,
  data,
  client
}: {
  statement: string
  data: T
  client: GraphQLClient
}) => {
  const execute = client.execute.bind({})
  client.execute = (innerStatement, variables) => {
    if (innerStatement === statement) {
      return { value: Promise.resolve(data), onCancel: jest.fn() }
    }
    return execute(innerStatement, variables)
  }
}
