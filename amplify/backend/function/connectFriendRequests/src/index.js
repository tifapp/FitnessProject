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

exports.handler = (event, context) => {
  //eslint-disable-line
  event.Records.forEach(record => {
    if (record.eventName == "INSERT") {
      axios({
        url: process.env.API_URL,
        method: 'post',
        headers: {
          'x-api-key': process.env.API_<YOUR_API_NAME>_GRAPHQLAPIKEYOUTPUT
        },
        data: {
          query: print(getFriendRequest),
          variables: {
            input: {
              sender: JSON.stringify(record.dynamodb.NewImage.receiver.S),
              receiver: JSON.stringify(record.dynamodb.NewImage.sender.S),
            }
          }
        }
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
