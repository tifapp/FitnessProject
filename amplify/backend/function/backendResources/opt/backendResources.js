const AWS = require("aws-sdk");
const AUTH_TYPE = require("aws-appsync").AUTH_TYPE;
const AWSAppSyncClient = require("aws-appsync").default;
const config = {
  url: process.env.API_FITNESSPROJECTAPI_GRAPHQLAPIENDPOINTOUTPUT,
  region: process.env.AWS_REGION,
  auth: {
    type: AUTH_TYPE.AWS_IAM,
    credentials: AWS.config.credentials,
  },
  disableOffline: true,
};

exports.sns = new AWS.SNS();

exports.s3 = new AWS.S3();

exports.client = new AWSAppSyncClient(config);

const { Expo } = require("expo-server-sdk");

// Create a new Expo SDK client
let expo = new Expo();

exports.sendNotification = async (deviceToken, message, data) => {
  if (deviceToken == null || deviceToken == "") return;

  ////console.log("creating notification");
  const pushMessage = {
    to: String(deviceToken),
    sound: "default",
    body: message,
    data: { status: "ok",
            ...data },
  };
  try {
    let tickets = await expo.sendPushNotificationsAsync([pushMessage]);
    // NOTE: If a ticket contains an error code in ticket.details.error, you
    // must handle it appropriately. The error codes are listed in the Expo
    // documentation:
    // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
    async () => {
      // Like sending notifications, there are different strategies you could use
      // to retrieve batches of receipts from the Expo service.
      try {
        let receipts = await expo.getPushNotificationReceiptsAsync(
          tickets[0].id
        );
        //console.log(receipts);

        // The receipts specify whether Apple or Google successfully received the
        // notification and information about an error, if one occurred.
        for (let receipt of receipts) {
          if (receipt.status === "ok") {
            continue;
          } else if (receipt.status === "error") {
            console.error(
              `There was an error sending a notification: ${receipt.message}`
            );
            if (receipt.details && receipt.details.error) {
              // The error codes are listed in the Expo documentation:
              // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
              // You must handle the errors appropriately.
              console.error(`The error code is ${receipt.details.error}`);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
  } catch (error) {
    console.error(error);
  }
};
