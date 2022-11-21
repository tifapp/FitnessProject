import API, { GraphQLQuery } from "@aws-amplify/api";
import { loadCapitals } from "@hooks/stringConversion";
import { graphqlOperation } from "aws-amplify";
import { User } from "src/models";
import { getUser } from "../src/graphql/queries";

export default async function fetchUserAsync(userId: string): Promise<{name: string | null | undefined, identityId: string | null | undefined, status: string | null | undefined, isVerified: boolean | null | undefined}> {
  const user = await API.graphql<GraphQLQuery<{getUser: User}>>(graphqlOperation(getUser, { id: userId }));
  const fields = user.data?.getUser;

  if (fields == null) { //ex. if user doesnt exist because it was deleted
    return {
      name: "Deleted User",
      identityId: "",
      status: "",
      isVerified: false,
    }; 
  } else {
    return {
      name: loadCapitals(fields.name),
      identityId: fields.identityId,
      status: fields.status,
      isVerified: fields.isVerified,
    }; //should we make a separate query/table just for the name?
  }
}
