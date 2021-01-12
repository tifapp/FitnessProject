const AWS = require('aws-sdk/global');
const AUTH_TYPE = require('aws-appsync').AUTH_TYPE;
const AWSAppSyncClient = require('aws-appsync').default;
const gql = require('graphql-tag');

const config = {
  url: process.env.API_FITNESSPROJECT_GRAPHQLAPIENDPOINTOUTPUT,
  region: process.env.AWS_REGION,
  auth: {
    type: AUTH_TYPE.AWS_IAM,
    credentials: AWS.config.credentials,
  },
  disableOffline: true
};

const postsByParentId =
/* GraphQL */ `
query PostsByParentId(
  $parentId: String
  $isReply: ModelIntKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelPostFilterInput
  $limit: Int
  $nextToken: String
) {
  postsByParentId(
    parentId: $parentId
    isReply: $isReply
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      timestamp
      userId
      parentId
      description
      group
      isReply
      createdAt
      updatedAt
    }
    nextToken
  }
}
`;

const deletePost = /* GraphQL */ `
mutation DeletePost(
  $input: DeletePostInput!
  $condition: ModelPostConditionInput
) {
  deletePost(input: $input, condition: $condition) {
    timestamp
    userId
    parentId
    description
    group
    isReply
    createdAt
    updatedAt
  }
}
`;

exports.handler = event => {
  //eslint-disable-line
  console.log(JSON.stringify(event, null, 2));
  event.Records.forEach(record => {
    if (record.eventName == "REMOVE") {
      (async () => {
        try {
          const parentId = record.dynamodb.NewImage.parentId.S;
          const results = await client.query({
            query: gql(postsByParentId),
            variables: {
              parentId: parentId
            }
          });

          results.data.postsByParentId.forEach(post => {
            await client.mutate({
              mutation: gql(deletePost),
              variables: {
                input: {
                  timestamp: post.timestamp,
                  userId: post.userId,
                }
              }
            });
          });
        } catch (e) {
          console.warn('Error sending mutation: ',  e);
        }
      })();
    }
  });
  return Promise.resolve('Successfully processed DynamoDB record');
};
