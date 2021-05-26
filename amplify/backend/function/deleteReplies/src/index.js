/* Amplify Params - DO NOT EDIT
	API_FITNESSPROJECTAPI_GRAPHQLAPIENDPOINTOUTPUT
	API_FITNESSPROJECTAPI_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */
require('isomorphic-fetch');
const gql = require('graphql-tag');

const { postsByParentId, likesByPost } = require('/opt/queries');
const { deletePost, deleteLike } = require('/opt/mutations');
const { client } = require('/opt/backendResources');

exports.handler = (event, context, callback) => {
  event.Records.forEach((record) => {
    if (record.eventName == "REMOVE") {
      const parentId = record.dynamodb.OldImage.parentId.S;

      const createdAt = record.dynamodb.OldImage.createdAt.S;
      const userId = record.dynamodb.OldImage.userId.S;
      (async () => {
        try {
          while (true) {
            const results = await client.query({
              query: gql(likesByPost),
              variables: {
                postId: createdAt + "#" + userId,
              }
            });

            if (results.data.likesByPost.items.length <= 0) break;

            await Promise.all(results.data.likesByPost.items.map(async (like) => {
              client.mutate({
                mutation: gql(deleteLike),
                variables: {
                  input: {
                    userId: like.userId,
                    postId: like.postId
                  }
                }
              });
            }));
          }

          callback(null, "successfully deleted likes");
        } catch (e) {
          console.warn('Error deleting likes: ', e);
          callback(Error(e));
        }
      })();

      if (record.dynamodb.OldImage.isParent.N == 1) {
        (async () => {
          try {
            while (true) {
              const results = await client.query({
                query: gql(postsByParentId),
                variables: {
                  parentId: parentId,
                }
              });
              
              if (results.data.postsByParentId.items.length <= 0) break;

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
            }

            callback(null, "successfully deleted replies");
          } catch (e) {
            console.warn('Error deleting replies: ', e);
            callback(Error(e));
          }
        })();
      }
    }
  });
};