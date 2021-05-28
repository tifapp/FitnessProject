require('isomorphic-fetch');
const gql = require('graphql-tag');

const { postsByUser, listFriendships, friendsByReceiver } = require('/opt/queries');
const { deletePost, deleteFriendship } = require('/opt/mutations');
const { client } = require('/opt/backendResources');

exports.handler = (event, context, callback) => {
  //eslint-disable-line
  event.Records.forEach((record) => {
    if (record.eventName == "REMOVE") {
      const userId = record.dynamodb.OldImage.id.S;

      (async () => {
        try {
          while (true) {
            const results = await client.query({
              query: gql(postsByUser),
              variables: {
                userId: userId,
              }
            });

            await Promise.all(results.data.postsByUser.items.map(async (post) => {
              client.mutate({
                mutation: gql(deletePost),
                variables: {
                  input: {
                    userId: post.userId,
                    createdAt: post.createdAt
                  }
                }
              });
            }));
            
            if (results.data.postsByUser.nextToken == null) break;
          }

          callback(null, "successfully deleted posts");
        } catch (e) {
          console.warn('Error deleting posts: ', e);
          callback(Error(e));
        }
      })();
      
      (async () => {
        try {
          while (true) {
            const results = await client.query({
              query: gql(listFriendships),
              variables: {
                sender: userId,
              }
            });

            if (results.length <= 0) break;

            results.data.listFriendships.items.map((friendship) => {
              client.mutate({
                mutation: gql(deleteFriendship),
                variables: {
                  input: {
                    sender: friendship.sender,
                    receiver: friendship.receiver
                  }
                }
              });
            });
          }

          callback(null, "successfully deleted posts");
        } catch (e) {
          console.warn('Error deleting posts: ', e);
          callback(Error(e));
        }
      })();
      
      (async () => {
        try {
          while (true) {
            const results = await client.query({
              query: gql(friendsByReceiver),
              variables: {
                receiver: userId,
              }
            });

            await Promise.all(results.data.friendsByReceiver.items.map(async (friendship) => {
              client.mutate({
                mutation: gql(deleteFriendship),
                variables: {
                  input: {
                    sender: friendship.sender,
                    receiver: friendship.receiver
                  }
                }
              });
            }));

            if (results.data.friendsByReceiver.nextToken == null) break;
          }

          callback(null, "successfully deleted posts");
        } catch (e) {
          console.warn('Error deleting posts: ', e);
          callback(Error(e));
        }
      })();
    }
  });
};
