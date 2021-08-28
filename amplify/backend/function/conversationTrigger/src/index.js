/* Amplify Params - DO NOT EDIT
	API_FITNESSPROJECTAPI_GRAPHQLAPIENDPOINTOUTPUT
	API_FITNESSPROJECTAPI_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */
require('isomorphic-fetch');
const gql = require('graphql-tag');

const { deletePost } = require('/opt/mutations');
const { postsByChannel } = require('/opt/queries');
const { client } = require('/opt/backendResources');

exports.handler = async (event) => {
  //eslint-disable-line
  return await Promise.all(event.Records.map(async record => {
    if (record.eventName == "REMOVE") {
      try {
        while (true) {
          const results = await client.query({
            query: gql(postsByChannel),
            variables: {
              channel: record.dynamodb.OldImage.id.S,
            }
          });

          //console.log(results.data)

          await Promise.all(results.data.postsByChannel.items.map(async (post) => {
            client.mutate({
              mutation: gql(deletePost),
              variables: {
                input: {
                  createdAt: post.createdAt,
                  userId: post.userId,
                }
              }
            });
          }));

          if (results.data.postsByChannel.nextToken == null) break;
        }

        return "successfully deleted messages";
      } catch (e) {
        console.warn('Error deleting replies: ', e);
        return e;
      }
    }
  }));
};
