require('isomorphic-fetch');
const AWS = require('aws-sdk/global');
const AUTH_TYPE = require('aws-appsync').AUTH_TYPE;
const AWSAppSyncClient = require('aws-appsync').default;
const gql = require('graphql-tag');

const config = {
  url: process.env.API_FITNESSPROJECTAPI_GRAPHQLAPIENDPOINTOUTPUT,
  region: process.env.AWS_REGION,
  auth: {
    type: AUTH_TYPE.AWS_IAM,
    credentials: AWS.config.credentials,
  },
  disableOffline: true
};

const client = new AWSAppSyncClient(config);

const incrementLikes = `
  mutation IncrementLikes($input: incrementLikesInput!) {
    incrementLikes(input: $input) {
      createdAt
      updatedAt
      userId
      description
      parentId
      channel
      receiver
      isParent
      likes
    }
  }
`;

async function sendNotification(deviceToken, message) {
  if (deviceToken == null || deviceToken == '') return;

  console.log("creating notification");
  const pushMessage = {
    to: String(deviceToken),
    sound: "default",
    body: message,
    data: { "status": "ok" }
  };
  try {
    let tickets = await expo.sendPushNotificationsAsync([pushMessage]);
    // NOTE: If a ticket contains an error code in ticket.details.error, you
    // must handle it appropriately. The error codes are listed in the Expo
    // documentation:
    // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
    async () => {
      // Like sending notifications, there are different strategies you could use
      // to retrieve batches of receipts from the Expo service.
      try {
        let receipts = await expo.getPushNotificationReceiptsAsync(tickets[0].id);
        console.log(receipts);

        // The receipts specify whether Apple or Google successfully received the
        // notification and information about an error, if one occurred.
        for (let receipt of receipts) {
          if (receipt.status === "ok") {
            continue;
          } else if (receipt.status === "error") {
            console.error(
              `There was an error sending a notification: ${receipt.message}`
            );
            if (receipt.details && receipt.details.error) {
              // The error codes are listed in the Expo documentation:
              // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
              // You must handle the errors appropriately.
              console.error(`The error code is ${receipt.details.error}`);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
  } catch (error) {
    console.error(error);
  }
}

exports.handler = (event, context, callback) => {
  //eslint-disable-line
  event.Records.forEach((record) => {
    let check = 0;
    if (record.eventName == "INSERT" || record.eventName == "REMOVE") {
      console.log("record is ", record);
      let postId = "placeholder";
      let likerUserId = "";
      if (record.eventName == "REMOVE")
        postId = record.dynamodb.OldImage.postId.S;
      else{
        console.log(record.dynamodb.NewImage);
        postId = record.dynamodb.NewImage.postId.S;
        likerUserId = record.dynamodb.NewImage.userId.S;
        check = 1;
      } 
      

      (async () => {
        try {
          //increment or decrement the post's likes
          //use the "ADD" function of the update resolver

          const ids = postId.split("#");

          /*
          if(ids.length < 5){
            console.log("Inside checker");
            callback(null, "Inside checker");
            return;
          }
          */

          const timestamp = ids[0];
          const userId = ids[1];
          const channel = ids[2];
          const parentId = ids[3];
          const isParent = ids[4];

          console.log("postid is ", postId);
          
          const inputVariables = {
            createdAt: timestamp,
            userId: userId,
            channel: channel,
            parentId: parentId,
            isParent: isParent,
          };

          if (record.eventName == "REMOVE") {
            inputVariables.decrement = true;
          }
          
          await client.mutate({
            mutation: gql(incrementLikes),
            variables: {
              input: inputVariables,
            },
          });
          

          //postId = "0ba02bd6-4137-43e6-8084-ffe87180151a"

          const authorName = await client.query({
            query: gql(getUser),
            variables: {
              id: postId
            }
          });

          const likerUserName = await client.query({
            query: gql(getUser),
            variables: {
              id: likerUserId
            }
          });

          console.log("author name" + authorName);
          console.log("likerUserName " + likerUserName);

          if(check){
            await sendNotification(authorName.data.getUser.deviceToken, likerUserName.data.getUser.name + " liked your message!"); //truncate the sender's name!
          }

          callback(null, "Successfully incremented like counter");
          return;
        } catch (e) {
          console.warn("Error sending mutation: ", e);
          callback(Error(e));
          return;
        }
      })();
    } else {
      callback(null, "Like was not inserted or deleted");
      return;
    }
  });
};
