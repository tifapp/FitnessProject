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

require("isomorphic-fetch");
const gql = require("graphql-tag");

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
      console.log(event.Records);
      if(record.eventName == "REMOVE"){
        try {
          const eventOwner= record.dynamodb.OldImage.userId.S;
          console.log("event owner is " + eventOwner)
          console.log("users in event are" + JSON.stringify(record.dynamodb.OldImage.users, null, 4))
          // get name of event owner for push message 
          const OwnerName = await client.query({
            query: gql(getUser),
            variables: {
              id: eventOwner,
            },
          });

          // hopfully gets list of all users in the post (OldImage == post before)
          if (record.dynamodb.OldImage.users.L != null) {
            console.log("inside if")
            console.log(record.dynamodb.OldImage.users.L.length)
            for (let i = 0; i < record.dynamodb.OldImage.users.L.length; i ++){
              console.log("user: " + i + record.dynamodb.OldImage.users.L[i]);
              const receiver = record.dynamodb.OldImage.users.L[i].S;
              const receiverName = await client.query({
                query: gql(getUser),
                variables: {
                  id: receiver,
                },
              });

              console.log("Receiver name: " + JSON.stringify(receiverName));

              console.log("Host" + JSON.stringify(record.dynamodb.OldImage.host.S))
              await sendNotification(
                receiverName.data.getUser.deviceToken, loadCapitals(record.dynamodb.OldImage.host.S) + " Has cancelled the event! "
              );
            }
            return "Successfully sent messaging notification";
          }
        } catch (e) {
          console.warn("Error sending reply: ", e);
          return Error(e);
          }
      } 
    
      else if(record.eventName == "MODIFY"){
        try {
            // event location has been changed
            if((record.dynamodb.OldImage.location.latitude != record.dynamodb.NewImage.location.latitude) ||
            (record.dynamodb.OldImage.location.longitude != record.dynamodb.NewImage.location.longitude)){
              // hopfully gets list of all users in the post (OldImage == post before)
              if (record.dynamodb.OldImage.users.L != null) { 
                for (let i = 0; i < record.dynamodb.OldImage.users.L.length; i ++){
                  console.log(record.dynamodb.OldImage.users.L[i]);

                  const receiver = record.dynamodb.OldImage.users.L[i].S;
                  const receiverName = await client.query({
                    query: gql(getUser),
                    variables: {
                      id: receiver,
                  },
                });

                  console.log(receiverName);

                  await sendNotification(
                    receiverName.data.getUser.deviceToken, loadCapitals(record.dynamodb.OldImage.host.S) + " Has changed the event location! "
                  );
                }
              }
            }

            // start and end time have been changed 
            if((record.dynamodb.OldImage.startDateTime != record.dynamodb.NewImage.startDateTime) && 
            (record.dynamodb.OldImage.endDateTime != record.dynamodb.NewImage.endDateTime)){

              if (record.dynamodb.OldImage.users.L != null) { 
                for (let i = 0; i < record.dynamodb.OldImage.users.L.length; i ++){
                  console.log(record.dynamodb.OldImage.users.L[i]);

                  const receiver = record.dynamodb.OldImage.users.L[i].S;
                  const receiverName = await client.query({
                    query: gql(getUser),
                    variables: {
                      id: receiver,
                    },
                  });

                  console.log(receiverName);

                  await sendNotification(
                    receiverName.data.getUser.deviceToken, loadCapitals(record.dynamodb.OldImage.host.S) + " Has changed the event start and end time! "
                  );
                }
              }
            }

              // the start date time has been changed 
            else if(record.dynamodb.OldImage.startDateTime != record.dynamodb.NewImage.startDateTime){
              
              if (record.dynamodb.OldImage.users.L != null) { 
                for (let i = 0; i < record.dynamodb.OldImage.users.L.length; i ++){
                  console.log(record.dynamodb.OldImage.users.L[i]);

                  const receiver = record.dynamodb.OldImage.users.L[i].S;
                  const receiverName = await client.query({
                    query: gql(getUser),
                    variables: {
                      id: receiver,
                    },
                  });

                  console.log(receiverName);

                  await sendNotification(
                    receiverName.data.getUser.deviceToken, loadCapitals(record.dynamodb.OldImage.host.S) + " Has changed the event start time! "
                  );
                }
              }
            }

            // the end date time has been changed 
            else if(record.dynamodb.OldImage.endDateTime != record.dynamodb.NewImage.endDateTime){

              if (record.dynamodb.OldImage.users.L != null) { 
                for (let i = 0; i < record.dynamodb.OldImage.users.L.length; i ++){
                  console.log(record.dynamodb.OldImage.users.L[i]);

                  const receiver = record.dynamodb.OldImage.users.L[i].S;
                  const receiverName = await client.query({
                    query: gql(getUser),
                    variables: {
                      id: receiver,
                    },
                  });

                  console.log(receiverName);

                  await sendNotification(
                    receiverName.data.getUser.deviceToken, loadCapitals(record.dynamodb.OldImage.host.S) + " Has changed the event end time! "
                  );
                }
              }
            }

            return "Successfully sent messaging notification";         
          } catch (e) {
          console.warn("Error sending reply: ", e);
          return Error(e);
          }
        }      
    })
  )
}