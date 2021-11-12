require('isomorphic-fetch');
const gql = require('graphql-tag');

const { postsByUser, listFriendships, friendsByReceiver, listLikes } = require('/opt/queries');
const { deletePost, deleteFriendship, deleteLike } = require('/opt/mutations');
const { client } = require('/opt/backendResources');

exports.handler = async (event, context, callback) => {
  //eslint-disable-line
  return await Promise.all(event.Records.map(async record => {
    if (record.eventName == "REMOVE") {
      const userId = record.dynamodb.OldImage.id.S;

      try {
        let nextToken = null;

        while (true) {
          const results = await client.query({
            query: gql(postsByUser),
            variables: {
              userId: userId,
              nextToken: nextToken,
            }
          });

          //console.log(results.data.postsByUser);
          nextToken = results.data.postsByUser.nextToken;

          await Promise.all(results.data.postsByUser.items.map(async (post) => 
            client.mutate({
              mutation: gql(deletePost),
              variables: {
                input: {
                  userId: post.userId,
                  createdAt: post.createdAt
                }
              }
            })
          ));

          if (nextToken == null) break;
        }

        while (true) {
          const results = await client.query({
            query: gql(listFriendships),
            variables: {
              sender: userId,
              nextToken: nextToken,
            }
          });
          
          nextToken = results.data.listFriendships.nextToken;

          await Promise.all(results.data.listFriendships.items.map((friendship) =>
            client.mutate({
              mutation: gql(deleteFriendship),
              variables: {
                input: {
                  sender: friendship.sender,
                  receiver: friendship.receiver
                }
              }
            })
          ));

          if (nextToken == null) break;
        }

        while (true) {
          const results = await client.query({
            query: gql(friendsByReceiver),
            variables: {
              receiver: userId,
              nextToken: nextToken,
            }
          });

          nextToken = results.data.friendsByReceiver.nextToken;

          await Promise.all(results.data.friendsByReceiver.items.map(async (friendship) =>
            client.mutate({
              mutation: gql(deleteFriendship),
              variables: {
                input: {
                  sender: friendship.sender,
                  receiver: friendship.receiver
                }
              }
            })
          ));

          if (nextToken == null) break;
        }
        
        while (true) {
          const results = await client.query({
            query: gql(listLikes),
            variables: {
              userId: userId,
              nextToken: nextToken,
            }
          });

          nextToken = results.data.listLikes.nextToken;

          await Promise.all(results.data.listLikes.items.map(async (like) =>
            client.mutate({
              mutation: gql(deleteLike),
              variables: {
                input: {
                  userId: userId,
                  postId: like.postId
                }
              }
            })
          ));

          if (nextToken == null) break;
        }

        return "successfully deleted posts";
      } catch (e) {
        console.warn('Error deleting posts: ', e);
        return e;
      }
    }
  }));
};
