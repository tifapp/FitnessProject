/* Amplify Params - DO NOT EDIT
	API_FITNESSPROJECTAPI_GRAPHQLAPIENDPOINTOUTPUT
	API_FITNESSPROJECTAPI_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */
require('isomorphic-fetch');
const gql = require('graphql-tag');

const {client} = require('/opt/backendResources');
const {deletePost} = require('/opt/mutations');
const {postsByChannel} = require('/opt/queries');

exports.handler = (event, context, callback) => {
  event.Records.forEach((record) => {
    if (record.eventName == "REMOVE") {
      const sender = record.dynamodb.OldImage.sender.S;
      const receiver = record.dynamodb.OldImage.receiver.S;

        (async () => {
          try {
            const results = await client.query({
              query: gql(postsByChannel),
              variables: {
                channel: sender<receiver?sender+receiver:receiver+sender,
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