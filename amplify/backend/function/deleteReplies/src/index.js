/* Amplify Params - DO NOT EDIT
	API_FITNESSPROJECTAPI_GRAPHQLAPIENDPOINTOUTPUT
	API_FITNESSPROJECTAPI_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */
require('isomorphic-fetch');
const gql = require('graphql-tag');

const { postsByParentId } = require('/opt/queries');
const { deletePost } = require('/opt/mutations');
const { client } = require('/opt/backendResources');

exports.handler = (event, context, callback) => {
  event.Records.forEach((record) => {
    if (record.eventName == "REMOVE") {
      const parentId = record.dynamodb.OldImage.parentId.S;
      if (record.dynamodb.OldImage.isParent.N == 1) {
        (async () => {
          try {
            const results = await client.query({
              query: gql(postsByParentId),
              variables: {
                parentId: parentId,
              }
            });

            await Promise.all(results.data.postsByParentId.items.map(async (post) => {
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

            callback(null, "successfully deleted replies");
            return;
          } catch (e) {
            console.warn('Error deleting replies: ', e);
            callback(Error(e));
            return;
          }
        })();
      }
    }
  });
};