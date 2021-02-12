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
          const userId = postId.substring(25);

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
            mutation: gql(incrementPostLikes),
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
  return Promise.resolve('Successfully processed DynamoDB record');
};
