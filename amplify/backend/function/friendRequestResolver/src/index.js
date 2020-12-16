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

  if (record.eventName == "INSERT") {
    (async () => {
      try {
        const result = await client.query({
          query: gql(frQuery),
          variables: {
            sender: '6fad5bc8-a389-4d73-b171-e709d5d8bdd8',
            receiver: 'c2217b13-12e8-42a4-a1ab-627f764493c9',
          }
        });
        console.log(result);
        callback(null, result.data);
      } catch (e) {
        console.warn('Error sending mutation: ',  e);
        callback(Error(e));
      }
    })();
  }
};