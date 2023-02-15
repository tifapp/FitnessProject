import { GraphQLClient } from "@lib/GraphQLClient"
import { unimplemented } from "./unimplemented"

/**
 * A `GraphQLOperations` instance that causes a test failure when any
 * of its methods are invoked.
 */
export const unimplementedGraphQLOperations: GraphQLClient = {
  execute: () => unimplemented("execute")
} as const

/**
 * Helper to set a mock response for a given graphql statement.
 */
export const mockGraphQLResponseForStatement = <T>({
  statement,
  data,
  operations
}: {
  statement: string
  data: T
  operations: GraphQLClient
}) => {
  const execute = operations.execute.bind({})
  operations.execute = async (innerStatement, variables) => {
    if (innerStatement === statement) {
      return data
    }
    return await execute(innerStatement, variables)
  }
}
