/* Amplify Params - DO NOT EDIT
	API_FITNESSPROJECT_GRAPHQLAPIENDPOINTOUTPUT
	API_FITNESSPROJECT_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT *//* Amplify Params - DO NOT EDIT
	API_FITNESSPROJECT_GRAPHQLAPIENDPOINTOUTPUT
	API_FITNESSPROJECT_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */const axios = require('axios');
const gql = require('graphql-tag');
const graphql = require('graphql');
const { print } = graphql;

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

exports.handler = async (event, context) => {
  //eslint-disable-line

  const record = event.Records[0];
  console.log(record);

  if (record.eventName == "INSERT") {
    try {
      console.log('in the axios phase');
      const graphqlData = await axios({
        url: process.env.API_FITNESSPROJECT_GRAPHQLAPIENDPOINTOUTPUT,
        method: 'post',
        headers: {
          'x-api-key': process.env.API_FITNESSPROJECT_GRAPHQLAPIIDOUTPUT
        },
        data: {
          query: print(getFriendRequest),
          variables: {
            sender: JSON.stringify(record.dynamodb.NewImage.receiver.S),
            receiver: JSON.stringify(record.dynamodb.NewImage.sender.S),
          }
        }
      })
      const body = {
        graphqlData: graphqlData.data.data.getFriendRequest
      }
      console.log(graphqlData.data.data.getFriendRequest);
      return {
        statusCode: 200,
        body: JSON.stringify(body),
        headers: {
          "Access-Control-Allow-Origin": "*",
        }
      }
    } catch (err) {
      console.log('error posting to appsync: ', err);
    }

    //read the friendrequest table to see if an opposing friend request appears
    //if so, read the friendship table to see if a friendship between these two users appears
    //if not, make a friendship
    //if so, increment the friendship's hifives.
  }

  return Promise.resolve('Successfully processed DynamoDB record');
};
