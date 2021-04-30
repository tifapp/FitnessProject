require('isomorphic-fetch');
const gql = require('graphql-tag');

const { incrementLikes, decrementLikes } = require('/opt/mutations');
const {getUser} = require('/opt/queries');
const { client, sendNotification } = require('/opt/backendResources');

exports.handler = (event, context, callback) => {
  //eslint-disable-line
  event.Records.forEach((record) => {
    if (record.eventName == "INSERT" || record.eventName == "REMOVE") {
      console.log("record is ", record);
      const postId = record.eventName == "INSERT" ? record.dynamodb.NewImage.postId.S : record.dynamodb.OldImage.postId.S;

      (async () => {
        try {
          //increment or decrement the post's likes
          //use the "ADD" function of the update resolver

          const ids = postId.split("#");
          const createdAt = ids[0];
          const userId = ids[1];
          const channel = ids[2];
          const parentId = ids[3];
          const isParent = ids[4];

          console.log("postid is ", postId);

          const inputVariables = {
            createdAt: createdAt,
            userId: userId,
            parentId: parentId,
            isParent: isParent,
            channel: channel,
          };

          if (record.eventName == "INSERT") {
            client.mutate({
              mutation: gql(incrementLikes),
              variables: {
                input: inputVariables,
              },
            });
            
            const likerUserId = record.dynamodb.NewImage.userId.S;      
  
            const authorName = await client.query({
              query: gql(getUser),
              variables: {
                id: userId
              }
            });
  
            const likerUserName = await client.query({
              query: gql(getUser),
              variables: {
                id: likerUserId
              }
            });
  
            await sendNotification(authorName.data.getUser.deviceToken, likerUserName.data.getUser.name + " liked your post!"); //truncate the sender's name!
          } else {
            client.mutate({
              mutation: gql(decrementLikes),
              variables: {
                input: inputVariables,
              },
            });
          }
          callback(null, "Successfully incremented like counter");
        } catch (e) {
          console.warn("Error sending mutation: ", e);
          callback(Error(e));
        }
      })();
    }
  });
};
