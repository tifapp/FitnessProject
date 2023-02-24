
/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	API_FITNESSPROJECTAPI_GRAPHQLAPIIDOUTPUT
	API_FITNESSPROJECTAPI_GRAPHQLAPIENDPOINTOUTPUT
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = event => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  for (const record of event.Records) {
    console.log(record.eventID);
    console.log(record.eventName);
    console.log('DynamoDB Record: %j', record.dynamodb);
  }
  return Promise.resolve('Successfully processed DynamoDB record');
};
