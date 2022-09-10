/* Amplify Params - DO NOT EDIT
	API_FITNESSPROJECTAPI_GRAPHQLAPIENDPOINTOUTPUT
	API_FITNESSPROJECTAPI_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const s3 = require("aws-sdk/clients/s3");
const {
  client,
  sendNotification,
} = require("../../backendResources/opt/backendResources");
const { updateChallenge } = require("../../backendResources/opt/mutations");
const { postsByLikes, getUser } = require("../../backendResources/opt/queries");
require("isomorphic-fetch");
const gql = require("graphql-tag");
const { loadCapitals } = require("../../backendResources/opt/stringConversion");

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  return await Promise.all(
    event.Records.map(async (record) => {
      if (record.eventName == "MODIFY") {
        try {
          const channel = record.dynamodb.NewImage.id;

          const posts = await client.query({
            query: gql(postsByLikes),
            variables: {
              channel,
            },
          });

          const winnerId = posts.data.postsByLikes[0].userId;

          await client.mutate({
            mutation: gql(updateChallenge),
            variables: {
              input: {
                id: channel,
                winner: winnerId,
              },
            },
          });

          const winner = await client.query({
            query: gql(getUser),
            variables: {
              id: winnerId,
            },
          });

          //if (friendshipcheck.data.getFriendship != null) {
          await sendNotification(
            winner.data.getUser.deviceToken,
            "You won the challenge!"
          ); //truncate the sender's name!
        } catch (e) {
          console.warn("Error sending reply: ", e);
          return Error(e);
        }
      }
    })
  );
};
