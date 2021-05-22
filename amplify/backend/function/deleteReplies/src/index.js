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

      const likes = record.dynamodb.OldImage.likes.N;
      const createdAt = record.dynamodb.OldImage.createdAt.S;
      const userId = record.dynamodb.OldImage.userId.S;
      (async () => {
        try {
          while (likes > 0) {
            const results = await client.query({
              query: gql(likesByPost),
              variables: {
                postId: createdAt + "#" + userId,
              }
            });

            if (results.length <= 0) break;

            likes = likes - results.length

            results.data.likesByPost.items.map((like) => {
              client.mutate({
                mutation: gql(deleteLike),
                variables: {
                  input: {
                    userId: like.userId,
                    postId: like.postId
                  }
                }
              });
            });
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
            const results = await client.query({
              query: gql(postsByParentId),
              variables: {
                parentId: parentId,
              }
            });

            results.data.postsByParentId.items.map((post) => {
              client.mutate({
                mutation: gql(deletePost),
                variables: {
                  input: {
                    createdAt: post.createdAt,
                    userId: post.userId,
                  }
                }
              });
            });

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