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
  url: process.env.API_FITNESSPROJECT_GRAPHQLAPIENDPOINTOUTPUT,
  region: process.env.AWS_REGION,
  auth: {
    type: AUTH_TYPE.AWS_IAM,
    credentials: AWS.config.credentials,
  },
  disableOffline: true
};

const getFriendRequest =
`
  query GetFriendRequest($sender: ID!, $receiver: ID!) {
    getFriendRequest(sender: $sender, receiver: $receiver) {
      sender
      receiver
      createdAt
      updatedAt
    }
  }
`;

const getFriendship =
`
  query GetFriendship($user1: ID!, $user2: ID!) {
    getFriendship(user1: $user1, user2: $user2) {
      user1
      user2
      timestamp
      hifives
      createdAt
      updatedAt
    }
  }
`;

const updateFriendship =
`
  mutation UpdateFriendship(
    $input: UpdateFriendshipInput!
    $condition: ModelFriendshipConditionInput
  ) {
    updateFriendship(input: $input, condition: $condition) {
      user1
      user2
      timestamp
      hifives
      createdAt
      updatedAt
    }
  }
`;

const deleteFriendRequest =
`
  mutation DeleteFriendRequest(
    $input: DeleteFriendRequestInput!
    $condition: ModelFriendRequestConditionInput
  ) {
    deleteFriendRequest(input: $input, condition: $condition) {
      sender
      receiver
      createdAt
      updatedAt
    }
  }
`;

const createFriendship =
`
  mutation CreateFriendship(
    $input: CreateFriendshipInput!
    $condition: ModelFriendshipConditionInput
  ) {
    createFriendship(input: $input, condition: $condition) {
      user1
      user2
      timestamp
      hifives
      createdAt
      updatedAt
    }
  }
`;

const getUser =
`
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

const client = new AWSAppSyncClient(config);

exports.handler = (event, context, callback) => {
  const record = event.Records[0];
  console.log(record);

  event.Records.forEach((record) => {
    if (record.eventName == "INSERT") {
      (async () => {
        try {
          //console.log('getting a new object with a sender of ', JSON.stringify(record.dynamodb.NewImage.sender.S), 'seeing if an object exists with that receiver');
          const receiver = record.dynamodb.NewImage.receiver.S;
          const sender = record.dynamodb.NewImage.sender.S;
          const result = await client.query({
            query: gql(getFriendRequest),
            variables: {
              sender: receiver,
              receiver: sender,
            }
          });
          
          const senderUser = await client.query({
            query: gql(getUser),
            variables: {
              id: sender
            }
          });
          if (senderUser.data.getUser == null) {
            console.log('couldnt find matching user');
            callback(null, senderUser.data);
            return;
          }
          const receiverUser = await client.query({
            query: gql(getUser),
            variables: {
              id: receiver
            }
          });
          if (receiverUser.data.getUser == null) {
            console.log('couldnt find matching user');
            callback(null, receiverUser.data);
            return;
          }

          if (result.data.getFriendRequest == null) {
            console.log('couldnt find matching friend request');
            
            await sendNotification(receiverUser.data.getUser.deviceToken, senderUser.data.getUser.name + " sent you a friend request!"); //truncate the sender's name!

            callback(null, result.data);
            return;
          } else {
            console.log('found matching friend request!');
          }
          console.log(result);
          await client.mutate({
            mutation: gql(deleteFriendRequest),
            variables: {
              input: {
                sender: receiver,
                receiver: sender,
              }
            }
          });
          await client.mutate({
            mutation: gql(deleteFriendRequest),
            variables: {
              input: {
                sender: sender,
                receiver: receiver,
              }
            }
          });

          const friendshipcheck = await client.query({
            query: gql(getFriendship),
            variables: {
              user1: receiver < sender ? receiver : sender,
              user2: receiver < sender ? sender : receiver,
            }
          });
          if (friendshipcheck.data.getFriendship == null) {
            //for making a new friendship
            await client.mutate({
              mutation: gql(createFriendship),
              variables: {
                input: {
                  user1: receiver < sender ? receiver : sender,
                  user2: receiver < sender ? sender : receiver,
                  timestamp: Date.now(),
                  hifives: 0
                }
              }
            });
            
            sendNotification(receiverUser.data.getUser.deviceToken, senderUser.data.getUser.name + " accepted your friend request!");
          } else {
            //for incrementing hi-fives
            await client.mutate({
              mutation: gql(updateFriendship),
              variables: {
                input: {
                  user1: friendshipcheck.data.getFriendship.user1,
                  user2: friendshipcheck.data.getFriendship.user2,
                  hifives: friendshipcheck.data.getFriendship.hifives + 1
                }
              }
            });
          }
        } catch (e) {
          console.warn('Error sending mutation: ',  e);
        }
      })();
    }
  });
};