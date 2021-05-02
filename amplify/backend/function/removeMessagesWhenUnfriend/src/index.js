/* Amplify Params - DO NOT EDIT
	API_FITNESSPROJECTAPI_GRAPHQLAPIENDPOINTOUTPUT
	API_FITNESSPROJECTAPI_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */
require('isomorphic-fetch');
const gql = require('graphql-tag');

const {client} = require('/opt/backendResources');
const {deletePost, deleteConversation} = require('/opt/mutations');
const {postsByChannel} = require('/opt/queries');

exports.handler = (event, context, callback) => {
  event.Records.forEach((record) => {
    if (record.eventName == "REMOVE") {
      const sender = record.dynamodb.OldImage.sender.S;
      const receiver = record.dynamodb.OldImage.receiver.S;

      console.log("sender is ", sender);
      console.log("receiver is ", receiver);

      let elements = [sender, receiver];
      elements.sort();

        (async () => {
          try {
            client.mutate({
              mutation: gql(deleteConversation),
              variables: {
                input: {
                  id: sender<receiver ? sender+receiver:receiver+sender,
                }
              }
            });

            const results = await client.query({
              query: gql(postsByChannel),
              variables: {
                channel: sender<receiver?sender+receiver:receiver+sender,
              }
            });

            Promise.all(results.data.postsByChannel.items.map(async (post) => {
              client.mutate({
                mutation: gql(deletePost),
                variables: {
                  input: {
                    createdAt: post.createdAt,
                    userId: post.userId,
                  }
                }
              });
              console.log("post ", post);
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