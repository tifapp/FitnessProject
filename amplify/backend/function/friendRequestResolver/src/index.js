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

const frQuery =
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

const client = new AWSAppSyncClient(config);

exports.handler = (event, context, callback) => {
  const record = event.Records[0];
  console.log(record);

  event.Records.forEach((record) => {
    if (record.eventName == "INSERT") {
      (async () => {
        try {
          //console.log('getting a new object with a sender of ', JSON.stringify(record.dynamodb.NewImage.sender.S), 'seeing if an object exists with that receiver');
          const result = await client.query({
            query: gql(frQuery),
            variables: {
              sender: record.dynamodb.NewImage.receiver.S,
              receiver: record.dynamodb.NewImage.sender.S,
            }
          });
          if (result.data.getFriendRequest != null) {
            console.log("phase 2")
          }
          console.log(result);
        } catch (e) {
          console.warn('Error sending mutation: ',  e);
        }
      })();
    }
  });
};