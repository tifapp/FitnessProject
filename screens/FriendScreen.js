import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  PureComponent,
  SafeAreaView,
  LayoutAnimation,
} from "react-native";
import {
  getSortedConversations,
  listConversations,
  batchGetConversations,
  getConversation,
} from "../src/graphql/queries";
import {
  deleteConversation,
  updateFriendship,
  deleteFriendship,
} from "root/src/graphql/mutations";
import Accordion from "components/Accordion";
import {
  onCreatePostForReceiver,
  onCreatePostByUser,
  onCreateFriendRequestForReceiver,
  onAcceptedFriendship,
  onDeleteConversation,
  onDeleteFriendship,
} from "root/src/graphql/subscriptions";
import FriendRequestListItem from "components/FriendRequestListItem";
import APIList from "../components/APIList";
import { API, graphqlOperation, Cache } from "aws-amplify";
import { ProfileImageAndName } from "../components/ProfileImageAndName";
import FriendListItem from "components/FriendListItem";
import playSound from "../hooks/playSound";
import {
  listFriendRequests,
  friendsByReceiver,
  listFriendships,
  getFriendship,
  friendsBySecondUser,
  getFriendRequest,
} from "root/src/graphql/queries";
//import { listConversations } from "../amplify/#current-cloud-backend/function/backendResources/opt/queries";
//conversations and friends should be deleted when user is deleted

var styles = require("styles/stylesheet");
var subscriptions = [];

function FriendList({ navigation, route }) {
  const listRef = useRef();

  global.updateFriendsListWithMyNewMessage = (newPost) => {
    listRef.mutateData((friends) => {
      return friends.map((friend) => {
        if (
          newPost.receiver === friend.receiver ||
          newPost.receiver === friend.sender
        ) {
          friend.lastMessage = newPost.description;
          friend.lastUser = route.params?.myId;
        }
        return friend;
      });
    });
  };

  const loadLastMessageAndListenForNewOnes = async (newFriend) => {
    //if (currentFriends.current.find(item => item.sender === newFriend.sender && item.receiver === newFriend.receiver)) return;
    //check if a convo already exists between the two users
    const friendlistarray = [newFriend.sender, newFriend.receiver].sort();

    const convo = await API.graphql(
      graphqlOperation(getConversation, {
        id: friendlistarray[0] + friendlistarray[1],
      })
    );

    if (convo.data.getConversation != null) {
      console.log("found old condo");
      newFriend.lastMessage = convo.data.getConversation.lastMessage;
      newFriend.lastUser = convo.data.getConversation.lastUser;
    } else {
      console.log("couldnt find condo");
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    listRef.mutateData((currentFriends) => [newFriend, ...currentFriends]);
  };

  /*
  useEffect(() => {
    friendList.forEach((friend) =>
      global.addConversationIds(
        friend.sender == route.params?.myId ? friend.receiver : friend.sender
      )
    );
  }, [friendList]); //we must extract just the array of ids
  */

  useEffect(() => {
    const receivedConversationSubscription = API.graphql(
      graphqlOperation(onCreatePostForReceiver, {
        receiver: route.params?.myId,
      })
    ).subscribe({
      next: (event) => {
        //no need for security checks here
        listRef.mutateData((friends) => {
          return friends.map((friend) => {
            if (
              newPost.userId === friend.sender ||
              newPost.userId === friend.receiver
            ) {
              friend.lastMessage = newPost.description;
              friend.lastUser = newPost.userId;
              friend.isRead = null;
            }
            return friend;
          });
        });
        //foreach users in conversation, if it's not myid and it's in friend list, update friend list, and push it to the top.
        //alternatively for message screen, for each user in message screen, if it's in conversation push it to the top. otherwise just put this conversation at the top of the list.
      },
    });

    const friendSubscription = API.graphql(
      graphqlOperation(onAcceptedFriendship)
    ).subscribe({
      next: async (event) => {
        console.log("friend subscription fired ");

        const newFriend = event.value.data.onAcceptedFriendship;
        //we can see all friend requests being accepted, so we just have to make sure it's one of ours.
        if (
          newFriend.sender === route.params?.myId ||
          newFriend.receiver === route.params?.myId
        ) {
          loadLastMessageAndListenForNewOnes(newFriend);
        }

        if (global.checkFriendshipMessage !== undefined) {
          let backupConversation = await API.graphql(
            graphqlOperation(getConversationByUsers, {
              users: [newFriend.sender, newFriend.receiver].sort(),
            })
          );
          console.log("Message Screen is unopened");

          backupConversation =
            backupConversation.data.getConversationByUsers.items[0];
          global.checkFriendshipMessage(backupConversation);
        }

        if (
          global.checkFriendshipMessage !== undefined &&
          global.checkFriendshipConversation !== undefined
        ) {
          console.log(
            "Both the Message Screen and Conversation Screens are opened"
          );
          let conversation = global.checkFriendshipMessage(
            newFriend.sender,
            newFriend.receiver
          );
          global.checkFriendshipConversation(conversation);
        }
      },
    });

    const removedFriendSubscription = API.graphql(
      graphqlOperation(onDeleteFriendship)
    ).subscribe({
      next: (event) => {
        const deletedFriend = event.value.data.onDeleteFriendship; //check the security on this one. if possible, should only fire for the sender or receiver.
        listRef.mutateData((currentFriends) => {
          let index = currentFriends.findIndex(
            (item) =>
              item.sender === deletedFriend.sender &&
              item.sender === deletedFriend.sender
          );
          if (index > -1) {
            currentFriends.splice(index, 1);
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );
          }
          return currentFriends;
        });
      },
    });
  }, []);

  const fetchLatestMessagesFromFriends = async (items) => {
    console.log(items);

    let conversationIds = [];

    items.forEach((item) => {
      conversationIds.push({
        id:
          item.sender < item.receiver
            ? item.sender + item.receiver
            : item.receiver + item.sender,
      });
    });

    try {
      const conversations = await API.graphql(
        graphqlOperation(batchGetConversations, { ids: conversationIds })
      );
      //console.log("looking for conversations: ", conversations);
      //returns an array of like objects or nulls corresponding with the array of conversations
      for (i = 0; i < items.length; ++i) {
        if (conversations.data.batchGetConversations[i] != null) {
          console.log("found conversation");
          items[i].lastMessage =
            conversations.data.batchGetConversations[i].lastMessage;
          items[i].lastUser =
            conversations.data.batchGetConversations[i].lastUser; //could also store the index of lastuser from the users array rather than the full string
        }
      }
      return items;
    } catch (err) {
      console.log("error in getting latest messages: ", err);
    }
  };

  const removeFriend = async (item, blocked) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // update friendList
    listRef.mutateData((friendList) => {
      return friendList.filter(
        (i) => i.sender !== item.sender || i.receiver !== item.receiver
      );
    });

    // delete friend object
    try {
      if (blocked) {
        global.localBlockList.push({
          createdAt: new Date(Date.now()).toISOString(),
          userId: route.params?.myId,
          blockee:
            item.receiver == route.params?.myId ? item.sender : item.receiver,
        });
        API.graphql(
          graphqlOperation(createBlock, {
            input: {
              blockee:
                item.receiver == route.params?.myId
                  ? item.sender
                  : item.receiver,
            },
          })
        );
      }
      await API.graphql(
        graphqlOperation(deleteFriendship, {
          input: { sender: item.sender, receiver: item.receiver },
        })
      );
    } catch (err) {
      console.log("error: ", err);
    }
  };

  return (
    <APIList
      ListHeaderComponent={
        <Text
          style={{
            fontSize: 20,
            color: "black",
            margin: 18,
          }}
        >
          Friends
        </Text>
      }
      style={{}}
      ref={listRef}
      queryOperation={listFriendships}
      filter={{
        filter: {
          and: [
            {
              or: [
                {
                  sender: {
                    eq: route.params?.myId,
                  },
                },
                {
                  receiver: {
                    eq: route.params?.myId,
                  },
                },
              ],
            },
            {
              accepted: {
                eq: true,
              },
            },
          ],
        },
      }} //a batch function should be used to grab message previews. that would also make it easy to exclude any.
      processingFunction={fetchLatestMessagesFromFriends}
      initialAmount={15}
      additionalAmount={15}
      renderItem={({ item }) => (
        //!item.isRead ?
        <FriendListItem
          navigation={navigation}
          removeFriendHandler={removeFriend}
          item={item}
          sidebar={true}
          friendId={
            item.sender === route.params?.myId ? item.receiver : item.sender
          }
          myId={route.params?.myId}
          lastMessage={item.lastMessage}
          lastUser={item.lastUser}
          Accepted={item.Accepted}
        />
        //: null
      )}
      keyExtractor={(item) => item.createdAt.toString()}
      ListEmptyComponent={
        <Text
          style={{
            alignSelf: "center",
            justifyContent: "center",
            color: "gray",
            fontSize: 15,
          }}
        >
          No friends yet!
        </Text>
      }
    />
  );
}

export default function FriendScreen({ navigation, route }) {
  const listRef = useRef();

  const respondToRequest = (item, accepted) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    listRef.mutateData((friendRequestList) =>
      friendRequestList.map(function (i) {
        if (i.sender == item.sender && i.receiver == item.receiver) {
          if (accepted) {
            i.accepted = true;
          } else {
            i.rejected = true;
          }
        }
        return i;
      })
    ); //locally removes the item
  };

  const undoResponse = (item) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    listRef.mutateData((friendRequestList) =>
      friendRequestList.map(function (i) {
        if (i.sender == item.sender && i.receiver == item.receiver) {
          i.accepted = false;
          i.rejected = false;
        }
        return i;
      })
    ); //locally removes the item
  };

  // runs when either for accepting or rejecting a friend request
  const confirmResponse = async (item, isNew) => {
    //if (listRef.getData().length == 1) playSound("celebrate");
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    listRef.mutateData((friendRequestList) =>
      friendRequestList.filter(
        (i) => item.sender !== i.sender || item.receiver !== i.receiver
      )
    ); //locally removes the item

    try {
      if (item.accepted) {
        const conversationId = [item.sender, item.receiver].sort().join();

        let newConversation = await API.graphql(
          graphqlOperation(getConversation, { id: conversationId })
        );

        console.log(newConversation);

        if (newConversation.data.getConversation != null) {
          await API.graphql(
            graphqlOperation(updateConversation, {
              input: { id: conversationId, Accepted: 1 },
            })
          );
        }

        await API.graphql(
          graphqlOperation(updateFriendship, {
            input: { sender: item.sender, accepted: true },
          })
        );
        //console.log("accepted: " + accepted);
      } else {
        await API.graphql(
          graphqlOperation(deleteFriendship, {
            input: { sender: item.sender, receiver: item.receiver },
          })
        );
      }
    } catch (err) {
      console.log("error responding to request: ", err);
    }
  };

  useEffect(() => {
    /*
    Cache.getItem("lastOnline", {
      callback: () => {
        setLastOnlineTime(-1);
      },
    }) //we'll check if this user's profile image url was stored in the cache, if not we'll look for it
      .then((time) => {
        setLastOnlineTime(time);
      });
      */ //should be in a parent component or context

    // Executes when a user receieves a friend request
    // listening for new friend requests
    const friendRequestSubscription = API.graphql(
      graphqlOperation(onCreateFriendRequestForReceiver, {
        receiver: route.params?.myId,
      })
    ).subscribe({
      next: (event) => {
        //IMPORTANT: don't use "friendList" or "friendRequestList" variables in this scope, instead use "currentFriends.current" and "currentFriendRequests.current"

        //console.log("is drawer open? ", isDrawerOpen.current);
        const newFriendRequest =
          event.value.data.onCreateFriendRequestForReceiver;
        if (
          newFriendRequest.sender !== route.params?.myId &&
          newFriendRequest.receiver !== route.params?.myId
        )
          console.log("security error with incoming friend request");

        //if this new request is coming from someone already in your local friends list, remove them from your local friends list
        //if (currentFriends.current.find((item) => item.sender === newFriendRequest.sender)) {
        /*
        listRef.mutateData((currentFriends) =>
          currentFriends.filter(
            (item) =>
              item.sender != newFriendRequest.sender ||
              item.receiver != newFriendRequest.sender
          )
        );
        //}
        */

        //if this new request is not already in your local friend request list, add it to your local friend request list
        if (
          currentFriendRequests.current.find(
            (item) => item.sender === newFriendRequest.sender
          )
        ) {
          listRef.mutateData((currentFriendRequests) =>
            currentFriendRequests.current.filter(
              (item) =>
                item.sender != newFriendRequest.sender ||
                item.receiver != newFriendRequest.sender
            )
          );
        }

        //if the drawer is closed, show the blue dot in the corner
        global.showNotificationDot();

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        listRef.mutateData((currentFriendRequests) => [
          newFriendRequest,
          ...currentFriendRequests,
        ]);
      },
    });

    return () => {
      currentFriendRequests.current.forEach((item) => {
        if (item.rejected || item.accepted) confirmResponse(item);
      }); //or have this in the blur event
    };
  }, []);

  //setButton(false);

  /*
  // delete friend object
  try {
    if (blocked) {
      global.localBlockList.push({createdAt: (new Date(Date.now())).toISOString(), userId: route.params?.myId , blockee: item.receiver == route.params?.myId ? item.sender : item.receiver});
      API.graphql(
        graphqlOperation(createBlock, {
          input: { blockee: item.receiver == route.params?.myId ? item.sender : item.receiver },
        })
      );
    }
    await API.graphql(
      graphqlOperation(deleteFriendship, {
        input: { sender: item.sender, receiver: item.receiver },
      })
    );
  } catch (err) {
    //console("error: ", err);
  }
  */

  useEffect(() => {
    (async () => {
      try {
        const conversation = await API.graphql(
          graphqlOperation(listConversations)
        );
        const conversation1 = await API.graphql(
          graphqlOperation(getSortedConversations, { dummy: 0, Accepted: 0 })
        );

        console.log(conversation);
        console.log("########################");
        console.log(conversation1);

        console.log("Use Effect for getSortedConversations");
      } catch (err) {
        console.log("error: ", err);
      }
    })();
  }, []);

  const goToMessages = (id) => {
    if (!navigation.push) navigation.navigate(id);
    else navigation.push(id);
  };

  //instead of accordions we'll just use plain header texts
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <Accordion
        style={{ marginTop: 0 }}
        open={
          //friendRequestList.length > 0
          false
        }
        headerText={"Friend Requests"} //would be nice if we had a total friend request count. but then you'd be able to see when people revoke their friend requests.
        headerTextStyle={{
          fontSize: 18,
          color: "gray",
          textDecorationLine: "none",
          marginLeft: 18,
        }}
        openTextColor={"black"}
        iconColor={"gray"}
        iconOpenColor={"black"}
        empty={false}
      >
        <APIList
          style={{}}
          //initialLoadFunction={checkNewRequests}
          queryOperation={friendsByReceiver}
          filter={{
            receiver: route.params?.myId,
            sortDirection: "DESC",
            filter: {
              accepted: {
                attributeExists: false,
              },
            },
          }}
          ref={listRef}
          initialAmount={21}
          additionalAmount={15}
          renderItem={({ item, index }) => (
            <FriendRequestListItem
              navigation={navigation}
              item={item}
              respondRequestHandler={respondToRequest}
              undoResponseHandler={undoResponse}
              confirmResponseHandler={confirmResponse}
              myId={route.params?.myId}
              isNew={
                index < //< route.params.newfriendrequests
                20
              }
            />
          )}
          keyExtractor={(item) => item.sender}
          ListEmptyComponent={
            <Text
              style={{
                alignSelf: "center",
                justifyContent: "center",
                color: "gray",
                marginVertical: 15,
                fontSize: 15,
              }}
            >
              No new requests!
            </Text>
          }
        />
      </Accordion>
      <FriendList navigation={navigation} route={route} />
    </SafeAreaView>
  );
}
