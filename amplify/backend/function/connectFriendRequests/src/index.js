const axios = require('axios');
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
  event.Records.forEach(record => {
    if (record.eventName == "INSERT") {
      axios({
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
        .then(gqData => {
          console.log("checking if we can read the table... ", gqData.data.data.getFriendRequest);
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
