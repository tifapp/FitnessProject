require('isomorphic-fetch');
const AWS = require('aws-sdk/global');
const AUTH_TYPE = require('aws-appsync').AUTH_TYPE;
const AWSAppSyncClient = require('aws-appsync').default;
const gql = require('graphql-tag');

const config = {
  url: process.env.API_FITNESSPROJECT_GRAPHQLAPIENDPOINTOUTPUT, //still not sure why the apigraphqlendpoint variable is undefined here but not in the friendrequestresolver function
  region: process.env.AWS_REGION,
  auth: {
    type: AUTH_TYPE.AWS_IAM,
    credentials: AWS.config.credentials,
  },
  disableOffline: true
};

const client = new AWSAppSyncClient(config);

const postsByParentId =
`
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

const deletePost =
`
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

exports.handler = (event, context, callback) => {
  event.Records.forEach((record) => {
    if (record.eventName == "REMOVE") {
      const parentId = record.dynamodb.OldImage.parentId.S;
      if (record.dynamodb.OldImage.isReply.N == 1) {
        (async () => {
          try {
            const results = await client.query({
              query: gql(postsByParentId),
              variables: {
                parentId: parentId,
              }
            });

            results.data.postsByParentId.items.forEach(async (post) => {
              client.mutate({
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
            console.warn('Error sending mutation: ', e);
          }
        })();
      }
    }
  });
};