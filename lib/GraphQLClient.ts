import API, { GraphQLResult, graphqlOperation } from "@aws-amplify/api"
import { GraphQLError } from "graphql"
import { Cancellable } from "./Cancellable"
import { createDependencyKey } from "./dependencies"
import { MultiplexedError } from "./MultiplexedError"

/**
 * A generic interface for any grapql based API.
 */
export interface GraphQLClient {
  /**
   * Executes a grapql request and returns the data from its response.
   *
   * @param statement a grapql query
   * @param variables variables needed by the query
   */
  execute: <T>(statement: string, variables?: object) => Cancellable<T>

  // TODO: - Add a subscribe function
}

/**
 * An error thrown from a `GraphQLOperationsInstance`.
 */
export class GraphQLClientError<T> extends Error {
  readonly data?: T
  readonly error: MultiplexedError<GraphQLError>

  constructor ({ data, errors }: { data?: T; errors: GraphQLError[] }) {
    const error = new MultiplexedError(errors)
    super(error.message)
    this.error = error
    this.data = data
  }
}

/**
 * GraphQL operations backed by AWS Amplify.
 */
export class AmplifyGraphQLClient implements GraphQLClient {
  execute<T> (statement: string, variables?: object) {
    const operation = API.graphql({
      query: statement,
      variables
    })

    return {
      value: (async () => {
        const result = (await operation) as GraphQLResult<T>
        if (result.errors) {
          throw new GraphQLClientError({
            data: result.data,
            errors: result.errors
          })
        }
        return result.data as T
      })(),
      cancel: () => API.cancel(operation as Promise<GraphQLResult<T>>)
    }
  }
}

const graphQLClient = new AmplifyGraphQLClient() as GraphQLClient

/**
 * A `DependencyKey` for a `GraphQL` operations instance.
 */
export const graphQLClientDependencyKey = createDependencyKey(graphQLClient)
