//let's test this out! make friend requests and see if the logs are visible on cloudwatch

exports.handler = (event, context) => {
  //eslint-disable-line
  event.Records.forEach(record => {
    console.log('the event is...', JSON.stringify(event));
    console.log('the context is...', JSON.stringify(context));
  });
  return Promise.resolve('Successfully processed DynamoDB record');
};
