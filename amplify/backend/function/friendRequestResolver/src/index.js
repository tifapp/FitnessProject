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

const getFriendRequest =
`
  query GetFriendRequest($sender: ID!, $receiver: ID!) {
    getFriendRequest(sender: $sender, receiver: $receiver) {
      createdAt
      updatedAt
      sender
      receiver
    }
  }
`;

const getFriendship =
`
  query GetFriendship($user1: ID!, $user2: ID!) {
    getFriendship(user1: $user1, user2: $user2) {
      createdAt
      updatedAt
      user1
      user2
      hifives
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
      createdAt
      updatedAt
      user1
      user2
      hifives
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
      createdAt
      updatedAt
      user1
      user2
      hifives
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

exports.handler = (event, context, callback) => {
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
            callback(null, 'couldnt find matching user');
            return;
          }
          const receiverUser = await client.query({
            query: gql(getUser),
            variables: {
              id: receiver
            }
          });
          if (receiverUser.data.getUser == null) {
            callback(null, 'couldnt find matching user');
            return;
          }

          if (result.data.getFriendRequest == null) {
            console.log('couldnt find matching friend request');
            
            await sendNotification(receiverUser.data.getUser.deviceToken, senderUser.data.getUser.name + " sent you a friend request!"); //truncate the sender's name!

            callback(null, "Successfully sent friend request notification");
            return;
          } else {
            console.log('found matching friend request!');
          }

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
                  hifives: 0
                }
              }
            });
            
            await sendNotification(receiverUser.data.getUser.deviceToken, senderUser.data.getUser.name + " accepted your friend request!");
            callback(null, "Successfully formed a friendship and notified both users");
            return;
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
            
            callback(null, "Successfully incremented friendship level");
            return;
          }
        } catch (e) {
          console.warn('Error processing friend requests: ',  e);
          callback(Error(e));
          return;
        }
      })();
    }
  });
};