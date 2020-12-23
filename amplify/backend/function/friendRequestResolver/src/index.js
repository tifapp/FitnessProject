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
          if (result.data.getFriendRequest == null) {
            console.log('couldnt find matching friend request');
            callback(null, result.data);
            return;
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
          } else {
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