/* Amplify Params - DO NOT EDIT
	API_FITNESSPROJECTAPI_GRAPHQLAPIENDPOINTOUTPUT
	API_FITNESSPROJECTAPI_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
	process.env.STORAGE_MEDIA_BUCKETNAME,
Amplify Params - DO NOT EDIT */require('isomorphic-fetch');
const gql = require('graphql-tag');

const { incrementReplies, decrementReplies, deleteLike, deletePost } = require('/opt/mutations');
const {getUser, postsByChannel, likesByPost} = require('/opt/queries');
const { client, sendNotification, s3 } = require('/opt/backendResources');
const {loadCapitals} = require('/opt/stringConversion');
const SHA256 = require('/opt/hash');

exports.handler = (event, context, callback) => {
  event.Records.forEach((record) => {
    if (record.eventName == "INSERT") {
      (async () => {
        try {
          if (record.dynamodb.NewImage.receiver != null) {
            //message notifications
            const receiver = record.dynamodb.NewImage.receiver.S;
            const sender = record.dynamodb.NewImage.userId.S;
  
            const receiverName = await client.query({
              query: gql(getUser),
              variables: {
                id: receiver
              }
            });
  
            const senderName = await client.query({
              query: gql(getUser),
              variables: {
                id: sender
              }
            });
  
            //console.log(receiverName.data.getUser)
            //console.log(senderName.data.getUser)
  
            await sendNotification(receiverName.data.getUser.deviceToken, loadCapitals(senderName.data.getUser.name) + " sent you a message!"); //truncate the sender's name!
            //console.log("sent notifications finished")
            callback(null, "Successfully sent messaging notification");
          } else if (record.dynamodb.NewImage.parentId != null) {
            //reply notifications
            const parentPostId = record.dynamodb.NewImage.parentId.S;
            const replierId = record.dynamodb.NewImage.userId.S;
            
            const ids = parentPostId.split("#");
            const createdAt = ids[0];
            const userId = ids[1];
            
            const inputVariables = {
              createdAt: createdAt,
              userId: userId,
            };
            
            client.mutate({
              mutation: gql(incrementReplies),
              variables: {
                input: inputVariables,
              },
            });
  
            const replier = await client.query({
              query: gql(getUser),
              variables: {
                id: replierId
              }
            });
  
            const parent = await client.query({
              query: gql(getUser),
              variables: {
                id: userId
              }
            });
  
            // const friendshipcheck = await client.query({
            //   query: gql(getFriendship),
            //   variables: {
            //     user1: childId < uniqueParentNames.userId ? childId : uniqueParentNames.userId,
            //     user2: childId < uniqueParentNames.userId ? uniqueParentNames.userId : childId,
            //   }
            // });
  
            //if (friendshipcheck.data.getFriendship != null) {
              await sendNotification(parent.data.getUser.deviceToken, loadCapitals(replier.data.getUser.name) + " sent you a reply!"); //truncate the sender's name!
              callback(null, "Finished Replying");
            //}
          } else {
            callback(null, "not a message or reply");
          }
        }
        catch (e) {
          //console.warn('Error sending reply: ', e);
          callback(Error(e));
        }
      })();
    } else {
      (async () => {
        try {          
          if (record.dynamodb.OldImage.imageURL.S != null && record.dynamodb.OldImage.imageURL.S !== '') {
            await s3.deleteObject({ Bucket: process.env.STORAGE_MEDIA_BUCKETNAME, Key: `public/feed/${record.dynamodb.OldImage.imageURL.S}.jpg` }).promise()
          }

          //delete like objects, if any
          if (record.dynamodb.OldImage.likes.N > 0) {
            //check if there are likes to delete
            while (true) {
              //fetch likes
              const results = await client.query({
                query: gql(likesByPost),
                variables: {
                  postId: record.dynamodb.OldImage.createdAt.S + "#" + record.dynamodb.OldImage.userId.S,
                }
              });
  
              //delete likes
              await Promise.all(results.data.likesByPost.items.map(async (like) => {
                client.mutate({
                  mutation: gql(deleteLike),
                  variables: {
                    input: {
                      userId: like.userId,
                      postId: like.postId
                    }
                  }
                });
              }));
  
              //loop if there are more likes
              if (results.data.likesByPost.nextToken == null) break;
            }
          }

          //delete replies, if any
          if (record.dynamodb.OldImage.replies.N > 0) {
            while (true) {
              const results = await client.query({
                query: gql(postsByChannel),
                variables: {
                  channel: SHA256(record.dynamodb.OldImage.userId.S+record.dynamodb.OldImage.createdAt.S),
                }
              });

              await Promise.all(results.data.postsByChannel.items.map(async (post) => {
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

              if (results.data.postsByChannel.nextToken == null) break;
            }
          }

          if (record.dynamodb.OldImage.parentId != null) {
            //decrement parent post's reply counter
            const parentPostId = record.dynamodb.OldImage.parentId.S;
            
            const ids = parentPostId.split("#");
            const createdAt = ids[0];
            const userId = ids[1];
            
            const inputVariables = {
              createdAt: createdAt,
              userId: userId,
            };
            
            client.mutate({
              mutation: gql(decrementReplies),
              variables: {
                input: inputVariables,
              },
            });
            
            callback(null, "Finished Replying");
          } else {
            callback(null, "not a message or reply");
          }
        }
        catch (e) {
          //console.warn('Error sending reply: ', e);
          callback(Error(e));
        }
      })();
    }
  });
};