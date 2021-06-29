require('isomorphic-fetch');
const gql = require('graphql-tag');

const { incrementReplies, decrementReplies } = require('/opt/mutations');
const {getUser} = require('/opt/queries');
const { client, sendNotification } = require('/opt/backendResources');
const {loadCapitals} = require('/opt/stringConversion');

exports.handler = (event, context, callback) => {
  event.Records.forEach((record) => {
    if (record.eventName == "INSERT") {
      (async () => {
        try {
          if (record.dynamodb.NewImage.receiver != null) {
            //message notifications
            const receiver = record.dynamodb.NewImage.receiver.S;
            const sender = record.dynamodb.NewImage.userId.S;
  
            const receiverName = await client.query({
              query: gql(getUser),
              variables: {
                id: receiver
              }
            });
  
            const senderName = await client.query({
              query: gql(getUser),
              variables: {
                id: sender
              }
            });
  
            //console.log(receiverName.data.getUser)
            //console.log(senderName.data.getUser)
  
            await sendNotification(receiverName.data.getUser.deviceToken, loadCapitals(senderName.data.getUser.name) + " sent you a message!"); //truncate the sender's name!
            //console.log("sent notifications finished")
            callback(null, "Successfully sent messaging notification");
          } else if (record.dynamodb.NewImage.parentId != null) {
            //reply notifications
            const parentPostId = record.dynamodb.NewImage.parentId.S;
            const replierId = record.dynamodb.NewImage.userId.S;
            
            const ids = parentPostId.split("#");
            const createdAt = ids[0];
            const userId = ids[1];
            
            const inputVariables = {
              createdAt: createdAt,
              userId: userId,
            };
            
            client.mutate({
              mutation: gql(incrementReplies),
              variables: {
                input: inputVariables,
              },
            });
  
            const replier = await client.query({
              query: gql(getUser),
              variables: {
                id: replierId
              }
            });
  
            const parent = await client.query({
              query: gql(getUser),
              variables: {
                id: userId
              }
            });
  
            // const friendshipcheck = await client.query({
            //   query: gql(getFriendship),
            //   variables: {
            //     user1: childId < uniqueParentNames.userId ? childId : uniqueParentNames.userId,
            //     user2: childId < uniqueParentNames.userId ? uniqueParentNames.userId : childId,
            //   }
            // });
  
            //if (friendshipcheck.data.getFriendship != null) {
              await sendNotification(parent.data.getUser.deviceToken, loadCapitals(replier.data.getUser.name) + " sent you a reply!"); //truncate the sender's name!
              callback(null, "Finished Replying");
            //}
          } else {
            callback(null, "not a message or reply");
          }
        }
        catch (e) {
          //console.warn('Error sending reply: ', e);
          callback(Error(e));
        }
      })();
    } else if (record.eventName == "REMOVE") {
      (async () => {
        try {
          if (record.dynamodb.OldImage.parentId != null) {
            //reply notifications
            const parentPostId = record.dynamodb.OldImage.parentId.S;
            
            const ids = parentPostId.split("#");
            const createdAt = ids[0];
            const userId = ids[1];
            
            const inputVariables = {
              createdAt: createdAt,
              userId: userId,
            };
            
            client.mutate({
              mutation: gql(decrementReplies),
              variables: {
                input: inputVariables,
              },
            });
            
            callback(null, "Finished Replying");
          } else {
            callback(null, "not a message or reply");
          }
        }
        catch (e) {
          //console.warn('Error sending reply: ', e);
          callback(Error(e));
        }
      })();
    }
  });
};