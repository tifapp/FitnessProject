/* Amplify Params - DO NOT EDIT
You can access the following resource attributes as environment variables from your Lambda function
var environment = process.env.ENV
var region = process.env.REGION
var apiGraphqlapiGraphQLAPIIdOutput = process.env.API_BOYAKIGQL_GRAPHQLAPIIDOUTPUT
var apiGraphqlapiGraphQLAPIEndpointOutput = process.env.API_BOYAKIGQL_GRAPHQLAPIENDPOINTOUTPUT

Amplify Params - DO NOT EDIT */

const AWSAppSyncClient = require('aws-appsync').default;
const gql = require('graphql-tag');

let graphqlClient;

const getFriendRequest = gql`
  query GetFriendRequest($sender: ID!, $receiver: ID!) {
    getFriendRequest(sender: $sender, receiver: $receiver) {
      sender
      receiver
      createdAt
      updatedAt
    }
  }
`

exports.handler = (event, context) => {
  //got this from here https://amplify-sns.workshop.aws/en/50_follow_timeline/30_function_directive/_index.en.files/index.js
  if (!graphqlClient) {
    graphqlClient = new AWSAppSyncClient({
      url: env.API_FITNESSPROJECT_GRAPHQLAPIENDPOINTOUTPUT,
      region: env.REGION,
      auth: graphql_auth,
      disableOffline: true,
    });
  }

  //eslint-disable-line
  event.Records.forEach(record => {
    //based off of this doc https://docs.amplify.aws/cli/function#query
    if (record.eventName == "INSERT") {
      graphqlClient.query({
        query: gql(getFriendRequest),
        fetchPolicy: 'network-only',
        variables: {
          sender: JSON.stringify(record.dynamodb.NewImage.receiver.S),
          receiver: JSON.stringify(record.dynamodb.NewImage.sender.S),
        },
      })
        .then(gqData => {
          const body = {
            graphqlData: gqData.data.data.getFriendRequest
          }
          console.log("checking if we can read the table... ", gqData.data.data.getFriendRequest);
          return {
            statusCode: 200,
            body: JSON.stringify(body),
            headers: {
              "Access-Control-Allow-Origin": "*",
            }
          }
        })
        .catch(err => {
          console.log('error in reading fr table: ', err)
        });

      //read the friendrequest table to see if an opposing friend request appears
      //if so, read the friendship table to see if a friendship between these two users appears
      //if not, make a friendship
      //if so, increment the friendship's hifives.
    }
  });
  return Promise.resolve('Successfully processed DynamoDB record');
};
