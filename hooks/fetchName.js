import { API, graphqlOperation } from "aws-amplify";
import { getUser } from "../src/graphql/queries";
import { loadCapitals } from "hooks/stringConversion";

export default async function fetchUserAsync(userId) {
  const user = await API.graphql(graphqlOperation(getUser, { id: userId }));
  const fields = user.data.getUser;

  if (fields == null) {
    return null;
  } else {
    return {
      name: loadCapitals(fields.name),
      identityId: fields.identityId,
      status: fields.status,
      isVerified: fields.isVerified,
    }; //should we make a separate query/table just for the name?
  }
}
