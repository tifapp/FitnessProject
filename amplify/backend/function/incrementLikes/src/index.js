exports.handler = event => {
  //eslint-disable-line
  console.log(JSON.stringify(event, null, 2));
  event.Records.forEach(record => {
    if (record.eventName == "INSERT" || record.eventName == "REMOVE") {
      let postId = record.dynamodb.NewImage.postId.S;
      if (record.eventName == "REMOVE") {
        postId = record.dynamodb.OldImage.postId.S;
      }

      (async () => {
        try {
          const post = await client.query({
            query: gql(postsByParentId),
            variables: {
              parentId: parentId,
            }
          });

          client.mutate({
            mutation: record.eventName == "INSERT" ? gql(incrementPostLikes) : record.eventName == "REMOVE" ? gql(decrementPostLikes) : null,
            variables: {
              input: {
                createdAt: post.createdAt,
                userId: post.userId,
              }
            }
          });

        } catch (e) {
          console.warn('Error sending mutation: ', e);
        }
      })();
    }
  });
  return Promise.resolve('Successfully processed DynamoDB record');
};
