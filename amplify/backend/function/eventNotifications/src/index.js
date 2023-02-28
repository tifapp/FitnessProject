
/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	API_FITNESSPROJECTAPI_GRAPHQLAPIIDOUTPUT
	API_FITNESSPROJECTAPI_GRAPHQLAPIENDPOINTOUTPUT
Amplify Params - DO NOT EDIT */


/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
/** 
exports.handler = event => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  for (const record of event.Records) {
    console.log(record.eventID);
    console.log(record.eventName);
    console.log('DynamoDB Record: %j', record.dynamodb);
  }
  return Promise.resolve('Successfully processed DynamoDB record');
};
*/

const {
  deleteEvent,
} = require("/opt/mutations");

const { getUser, eventsByDate, listEvents, getEvent, eventOwner  } = require("/opt/queries");

const { client, sendNotification, s3 } = require("/opt/backendResources");
const { loadCapitals } = require("/opt/stringConversion");
const { SHA256 } = require("/opt/hash");
const { WellArchitected } = require('aws-sdk');

exports.handler = async (event, context, callback) => {
  return await Promise.all (
    event.Records.map(async (record) => {
      if(record.eventName == "REMOVE"){
        try {
          // get name of event owner for push message 
          const OwnerName = await client.query({
            query: gql(eventOwner),
            variables: {
              id: eventOwner,
            },
          });

          

          // hopfully gets list of all users in the post (OldImage == post before)
          if (record.dynamodb.OldImage.users.L != null) { 
            for (let i = 0; i < record.dynamodb.OldImage.users.length; i ++){
              console.log(record.dynamodb.OldImage.users.L[i]);

              const deviceToken = await client.query({
                query: gql(getUser),
                variables: {
                  id: deviceToken,
                },
              });

              const receiver = record.dynamodb.OldImage.users.L[i].S;
              console.log(receiver);

              await sendNotification(
                deviceToken, loadCapitals(OwnerName) + " Has cancelled the event! "
              );
            }
              
          }

          

        } 
          return "Successfully sent messaging notification";
      }
    })
  )
}

