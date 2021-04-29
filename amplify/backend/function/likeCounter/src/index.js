const {
  Expo
} = require("expo-server-sdk");

// Create a new Expo SDK client
let expo = new Expo();

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

const decrementLikes = `
  mutation DecrementLikes($input: incrementLikesInput!) {
    DecrementLikes(input: $input) {
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

const getUser = `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      identityId
      name
      age
      gender
      bio
      goals
      latitude
      longitude
      deviceToken
      createdAt
      updatedAt
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

          if (record.eventName == "REMOVE") {
            client.mutate({
              mutation: gql(decrementLikes),
              variables: {
                input: inputVariables,
              },
            });
          } else {
            client.mutate({
              mutation: gql(incrementLikes),
              variables: {
                input: inputVariables,
              },
            });
          }

          if (record.eventName == "INSERT") {
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
