require('isomorphic-fetch');
const gql = require('graphql-tag');

const { postsByUser } = require('/opt/queries');
const { deletePost } = require('/opt/mutations');
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
    }
  });
};
