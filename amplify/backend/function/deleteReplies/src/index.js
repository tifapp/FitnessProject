/* Amplify Params - DO NOT EDIT
	API_FITNESSPROJECTAPI_GRAPHQLAPIENDPOINTOUTPUT
	API_FITNESSPROJECTAPI_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */
require('isomorphic-fetch');
const AWS = require('aws-sdk/global');
const AUTH_TYPE = require('aws-appsync').AUTH_TYPE;
const AWSAppSyncClient = require('aws-appsync').default;
const gql = require('graphql-tag');

const config = {
  url: process.env.API_FITNESSPROJECTAPI_GRAPHQLAPIENDPOINTOUTPUT, //still not sure why the apigraphqlendpoint variable is undefined here but not in the friendrequestresolver function
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
  $isParent: ModelIntKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelPostFilterInput
  $limit: Int
  $nextToken: String
) {
  postsByParentId(
    parentId: $parentId
    isParent: $isParent
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      createdAt
      updatedAt
      userId
      description
      parentId
      channel
      receiver
      isParent
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
      createdAt
      updatedAt
      userId
      description
      parentId
      channel
      receiver
      isParent
    }
  }
`;

const batchDeletePosts = /* GraphQL */ `
  mutation BatchDeletePosts($posts: [DeletePostInput]) {
    batchDeletePosts(posts: $posts) {
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

exports.handler = (event, context, callback) => {
  event.Records.forEach((record) => {
    if (record.eventName == "REMOVE") {
      const parentId = record.dynamodb.OldImage.parentId.S;
      if (record.dynamodb.OldImage.isParent.N == 1) {
        (async () => {
          try {
            const results = await client.query({
              query: gql(postsByParentId),
              variables: {
                parentId: parentId,
              }
            });

            await Promise.all(results.data.postsByParentId.items.map(async (post) => {
              client.mutate({
                mutation: gql(deletePost),
                variables: {
                  input: {
                    createdAt: post.createdAt,
                    userId: post.userId,
                  }
                }
              });
            }));

            callback(null, "successfully deleted replies");
            return;
          } catch (e) {
            console.warn('Error deleting replies: ', e);
            callback(Error(e));
            return;
          }
        })();
      }
    }
  });
};