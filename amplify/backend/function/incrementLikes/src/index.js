require('isomorphic-fetch');
const AWS = require('aws-sdk/global');
const AUTH_TYPE = require('aws-appsync').AUTH_TYPE;
const AWSAppSyncClient = require('aws-appsync').default;
const gql = require('graphql-tag');

const config = {
  url: process.env.API_FITNESSPROJECTAPI_GRAPHQLAPIENDPOINTOUTPUT,
  region: process.env.AWS_REGION,
  auth: {
    type: AUTH_TYPE.AWS_IAM,
    credentials: AWS.config.credentials,
  },
  disableOffline: true
};

const client = new AWSAppSyncClient(config);

const incrementLikes =
`
  mutation IncrementLikes($post: incrementLikesInput) {
    incrementLikes(post: $post) {
      createdAt
      updatedAt
      userId
      description
      parentId
      channel
      receiver
      isParent
      likes
    }
  }
`;

exports.handler = event => {
  //eslint-disable-line
  console.log(JSON.stringify(event, null, 2));
  event.Records.forEach(record => {
    if (record.eventName == "INSERT" || record.eventName == "REMOVE") {
      const postId = record.eventName == "REMOVE" ? postId = record.dynamodb.OldImage.postId.S : record.dynamodb.NewImage.postId.S;

      (async () => {
        try {
          //increment or decrement the post's likes
          //use the "ADD" function of the update resolver

          const timestamp = postId.substring(0, 24);
          const userId = postId.substring(24);

          console.log("postid is ", postId);
          console.log("created at ", timestamp);
          console.log("made by ", userId);

          const inputVariables = {
            createdAt: timestamp,
            userId: userId,
          }

          if (record.eventName == "REMOVE") {
            inputVariables.decrement = true;
          }

          client.mutate({
            mutation: gql(incrementLikes),
            variables: {
              input: inputVariables
            }
          });

        } catch (e) {
          console.warn('Error sending mutation: ', e);
        }
      })();
    }
  });
};
