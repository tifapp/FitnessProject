/* Amplify Params - DO NOT EDIT
  API_FITNESSPROJECTAPI_GRAPHQLAPIENDPOINTOUTPUT
  API_FITNESSPROJECTAPI_GRAPHQLAPIIDOUTPUT
  ENV
  REGION
Amplify Params - DO NOT EDIT */

const { sns } = require('/opt/backendResources');

exports.handler = (event, context, callback) => {
  //eslint-disable-line
  event.Records.forEach((record) => {
    console.log('Stream record: ', JSON.stringify(record, null, 2));

    if (record.eventName == 'INSERT') {
      var params = {
        Subject: 'A new report',
        Message: record,
        TopicArn: 'arn:aws:sns:us-west-2:213277979580:Verification_Requests'
      };
      sns.publish(params, function (err, data) {
        if (err) {
          console.error("Unable to send message. Error JSON:", JSON.stringify(err, null, 2));
        } else {
          console.log("Results from sending message: ", JSON.stringify(data, null, 2));
        }
      });
    }
  });
  callback(null, `Successfully processed ${event.Records.length} records.`);
};
