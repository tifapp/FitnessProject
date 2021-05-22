require('isomorphic-fetch');
const gql = require('graphql-tag');

const { postsByUser, listFriendships, friendsByReceiver } = require('/opt/queries');
const { deletePost, deleteFriendship } = require('/opt/mutations');
const { client } = require('/opt/backendResources');

exports.handler = event => {
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

            if (results.length <= 0) break;

            results.data.postsByUser.items.map((post) => {
              client.mutate({
                mutation: gql(deletePost),
                variables: {
                  input: {
                    userId: post.userId,
                    createdAt: post.createdAt
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

            if (results.length <= 0) break;

            results.data.friendsByReceiver.items.map((friendship) => {
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
    }
  });
};
