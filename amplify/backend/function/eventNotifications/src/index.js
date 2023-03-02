
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

              const receiver = record.dynamodb.OldImage.users.L[i].S;
              const receiverName = await client.query({
                query: gql(getUser),
                variables: {
                  id: receiver,
                },
              });

              console.log(receiverName);

              await sendNotification(
                receiverName.data.getUser.deviceToken, loadCapitals(record.dynamodb.OldImage.Host) + " Has cancelled the event! "
              );
            }
            // deletes the event based on created at date and userId of event
            client.mutate({
              mutation: gql(deleteEvent),
              variables: {
                input: {
                  createdAt: record.dynamodb.OldImage.createdAt,
                  userId: record.dynamodb.OldImage.userId,
                },
              },
            });
              
            return "Successfully sent messaging notification";
          }



          

        } catch (e) {
          console.warn("Error sending reply: ", e);
          return Error(e);
          }
      } 
    
      if(record.eventName == "MODIFY"){
        try {
            // event location has been changed
            if((record.dynamodb.OldImage.location.latitude != record.dynamodb.NewImage.location.latitude) ||
            (record.dynamodb.OldImage.location.longitude != record.dynamodb.NewImage.location.longitude)){
              // hopfully gets list of all users in the post (OldImage == post before)
              if (record.dynamodb.OldImage.users.L != null) { 
                for (let i = 0; i < record.dynamodb.OldImage.users.length; i ++){
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
                    receiverName.data.getUser.deviceToken, loadCapitals(record.dynamodb.NewImage.Host) + " Has changed the event location! "
                  );
                }
              }
            }

            // start and end time have been changed 
            if((record.dynamodb.OldImage.startDateTime != record.dynamodb.NewImage.startDateTime) && 
            (record.dynamodb.OldImage.endDateTime != record.dynamodb.NewImage.endDateTime)){

              if (record.dynamodb.OldImage.users.L != null) { 
                for (let i = 0; i < record.dynamodb.OldImage.users.length; i ++){
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
                    receiverName.data.getUser.deviceToken, loadCapitals(record.dynamodb.NewImage.Host) + " Has changed the event start and end time! "
                  );
                }
              }
            }

              // the start date time has been changed 
            else if(record.dynamodb.OldImage.startDateTime != record.dynamodb.NewImage.startDateTime){
              
              if (record.dynamodb.OldImage.users.L != null) { 
                for (let i = 0; i < record.dynamodb.OldImage.users.length; i ++){
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
                    receiverName.data.getUser.deviceToken, loadCapitals(record.dynamodb.NewImage.Host) + " Has changed the event start time! "
                  );
                }
              }
            }

            // the end date time has been changed 
            else if(record.dynamodb.OldImage.endDateTime != record.dynamodb.NewImage.endDateTime){

              if (record.dynamodb.OldImage.users.L != null) { 
                for (let i = 0; i < record.dynamodb.OldImage.users.length; i ++){
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
                    receiverName.data.getUser.deviceToken, loadCapitals(record.dynamodb.NewImage.Host) + " Has changed the event end time! "
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

