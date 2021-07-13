require('isomorphic-fetch');
const gql = require('graphql-tag');

const { client, sendNotification } = require('/opt/backendResources');
const { getUser, postsByChannel } = require('/opt/queries');
const { deleteConversation, deletePost } = require('/opt/mutations');

exports.handler = (event, context, callback) => {
  //eslint-disable-line
  console.log(JSON.stringify(event, null, 2));
  event.Records.forEach(record => {
    if (record.eventName == "REMOVE") {
      (async () => {
        try {
          while (true) {
            const results = await client.query({
              query: gql(postsByChannel),
              variables: {
                channel: record.dynamodb.OldImage.id.S,
              }
            });

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

          callback(null, "successfully deleted messages");
          return;
        } catch (e) {
          console.warn('Error deleting replies: ', e);
          callback(Error(e));
          return;
        }
      })();
    }
  });
};