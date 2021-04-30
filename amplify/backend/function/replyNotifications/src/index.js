require('isomorphic-fetch');
const gql = require('graphql-tag');

const { client, sendNotification } = require('/opt/backendResources');
const {getUser, postsByParentId} = require('/opt/queries');

exports.handler = (event, context, callback) => {
  event.Records.forEach((record) => {
    if (record.eventName == "INSERT") {
      (async () => {
        try {
          if (record.dynamodb.NewImage.receiver != null) {
            //message notifications
            console.log("the new post is indeed a message")
            const receiver = record.dynamodb.NewImage.receiver.S;
            const sender = record.dynamodb.NewImage.userId.S;
            
            console.log("successfully saved receiver and sender variables")
  
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
  
            console.log(receiverName.data.getUser)
            console.log(senderName.data.getUser)
  
            await sendNotification(receiverName.data.getUser.deviceToken, senderName.data.getUser.name + " sent you a message!"); //truncate the sender's name!
            console.log("sent notifications finished")
            callback(null, "Successfully sent messaging notification");
          } else if (record.dynamodb.NewImage.isParent.N == 0) {
            //reply notifications
            const parentId = record.dynamodb.NewImage.parentId.S;
            const childId = record.dynamodb.NewImage.userId.S;
  
            console.log(record.dynamodb.NewImage);
  
            const parents = await client.query({
              query: gql(postsByParentId),
              variables: {
                parentId: parentId,
                sortDirection: 'DESC',
                limit: 1
              }
            });
  
            const uniqueParentNames = parents.data.postsByParentId.items[0];
  
            console.log("*************************************************");
            console.log(uniqueParentNames);
            console.log("*************************************************");
  
            const childPost = await client.query({
              query: gql(getUser),
              variables: {
                id: childId
              }
            });
  
            console.log("fetched child post");
  
            const parentPost = await client.query({
              query: gql(getUser),
              variables: {
                id: uniqueParentNames.userId
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
              await sendNotification(parentPost.data.getUser.deviceToken, childPost.data.getUser.name + " sent you a reply!"); //truncate the sender's name!
              callback(null, "Finished Replying");
            //}
          } else {
            callback(null, "not a message or reply");
          }
        }
        catch (e) {
          console.warn('Error sending reply: ', e);
          callback(Error(e));
        }
      })();
    }
  });
};