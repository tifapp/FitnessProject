import API, { GraphQLQuery } from "@aws-amplify/api"
import { loadCapitals } from "@hooks/stringConversion"
import { graphqlOperation } from "aws-amplify"
import { User } from "src/models"
import { getUser } from "../src/graphql/queries"

export default async function fetchUserAsync (userId: string): Promise<{name?: string | null, identityId?: string | null, status?: string | null, isVerified: boolean | null | undefined}> {
  const user = await API.graphql<GraphQLQuery<{getUser: User}>>(graphqlOperation(getUser, { id: userId }))
  const { name, status, isVerified, identityId } = user.data?.getUser ?? {}

  globalThis.savedUsers[userId] = {
    name: loadCapitals(name) ?? "Deleted User",
    status,
    isVerified: isVerified ?? false
  }

  return { ...globalThis.savedUsers[userId], identityId }
}
