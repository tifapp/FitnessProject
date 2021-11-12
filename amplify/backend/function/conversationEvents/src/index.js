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
        let nextToken = null;
        while (true) {
          const results = await client.query({
            query: gql(postsByChannel),
            variables: {
              channel: record.dynamodb.OldImage.id.S,
            }
          });

          //console.log(results.data)
          nextToken = results.data.postsByChannel.nextToken;

          await Promise.all(results.data.postsByChannel.items.map(async (post) => {
            client.mutate({
              mutation: gql(deletePost),
              variables: {
                input: {
                  userId: post.userId,
                  createdAt: post.createdAt,
                }
              }
            });
          }));

          if (nextToken == null) break;
        }

        return "successfully deleted messages";
      } catch (e) {
        console.warn('Error deleting messages: ', e);
        return e;
      }
    }
  }));
};
