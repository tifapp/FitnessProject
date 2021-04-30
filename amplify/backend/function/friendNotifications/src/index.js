require('isomorphic-fetch');
const gql = require('graphql-tag');

const { client, sendNotification } = require('/opt/backendResources');
const { getUser } = require('/opt/queries');

exports.handler = (event, context, callback) => {
  event.Records.forEach((record) => {
    if (record.eventName == "INSERT" || record.eventName == "MODIFY") {
      (async () => {
        try {
          console.log('getting a new object with a sender of ', JSON.stringify(record.dynamodb.NewImage.sender.S), 'seeing if an object exists with that receiver');
          const receiver = record.dynamodb.NewImage.receiver.S;
          const sender = record.dynamodb.NewImage.sender.S;
          
          const senderUser = await client.query({
            query: gql(getUser),
            variables: {
              id: sender
            }
          });
          if (senderUser.data.getUser == null) {
            callback(null, 'couldnt find matching user');
          }
          const receiverUser = await client.query({
            query: gql(getUser),
            variables: {
              id: receiver
            }
          });
          if (receiverUser.data.getUser == null) {
            callback(null, 'couldnt find matching user');
          }

          if (record.eventName == "INSERT") {
            console.log('couldnt find matching friend request');
            
            await sendNotification(receiverUser.data.getUser.deviceToken, senderUser.data.getUser.name + " sent you a friend request!"); //truncate the sender's name!
          } else {
            await sendNotification(senderUser.data.getUser.deviceToken, receiverUser.data.getUser.name + " accepted your friend request!"); //truncate the sender's name!
          }
          callback(null, "Successfully sent friend request notification");
        }
        catch (e) {
          console.warn('Error sending friend request notification: ', e);
          callback(Error(e));
        }
      })();
    }
  });
};
