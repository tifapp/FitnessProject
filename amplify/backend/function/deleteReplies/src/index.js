require('isomorphic-fetch');
const AWS = require('aws-sdk/global');
const AUTH_TYPE = require('aws-appsync').AUTH_TYPE;
const AWSAppSyncClient = require('aws-appsync').default;
const gql = require('graphql-tag');

const config = {
  url: "https://lsvxnu7alvawnjevasqpbwk6ni.appsync-api.us-west-2.amazonaws.com/graphql", //still not sure why the apigraphqlendpoint variable is undefined here but not in the friendrequestresolver function
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

const batchDeletePosts =
`
  mutation BatchDeletePosts($posts: [DeletePostInput]) {
    batchDeletePosts(posts: $posts) {
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

            let replies = [];

            results.data.postsByParentId.items.forEach(post => {
              if (post.timestamp != null && post.userId != null) {
                const postIDInfo = {
                  timestamp: post.timestamp,
                  userId: post.userId,
                }
                replies.push(postIDInfo);
              }
            });

            console.log(replies);

            if (replies.length > 0) {
              await client.mutate({
                mutation: gql(batchDeletePosts),
                variables: {
                  posts: replies
                }
              });
            }

          } catch (e) {
            console.warn('Error sending mutation: ', e);
          }
        })();
      }
    }
  });
};