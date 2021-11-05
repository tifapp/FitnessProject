import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  Image,
  Text,
  Linking,
  TouchableOpacity,
  LayoutAnimation
} from "react-native";
import { API, graphqlOperation, Cache } from "aws-amplify";
import {
  listFriendRequests,
  friendsByReceiver,
  listFriendships,
  getFriendship,
  friendsBySecondUser,
  getFriendRequest,
} from "root/src/graphql/queries";
import {
  onCreateFriendRequestForReceiver,
  onAcceptedFriendship,
  onCreatePostForReceiver
} from "root/src/graphql/subscriptions";
import { deleteFriendship, updateFriendship, createBlock, updateConversation } from "root/src/graphql/mutations";

import { ProfileImageAndName } from "components/ProfileImageAndName";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import APIList from "components/APIList";
import Accordion from "components/Accordion";
import FriendListItem from "components/FriendListItem";
import FriendRequestListItem from "components/FriendRequestListItem";
import playSound from "../hooks/playSound";
import { useIsDrawerOpen } from '@react-navigation/drawer';
import { batchGetConversations, getConversation, getConversations } from "../src/graphql/queries";
//import AsyncStorage from '@react-native-async-storage/async-storage';

global.localBlockList = [];

export default function CustomSidebarMenu({ navigation, state, progress, myId }) {
  const [lastOnlineTime, setLastOnlineTime] = useState(0);
  const [friendList, setFriendList] = useState([]);
  const [friendRequestList, setFriendRequestList] = useState([]);
  const [newFriendRequests, setNewFriendRequests] = useState(0); //should persist across sessions (ex. if you receive new friend requests while logged out)
  const [newConversations, setNewConversations] = useState(0); //should persist across sessions (ex. if you receive new friend requests while logged out)

  const isDrawerOpen = useRef();
  const currentFriends = useRef();
  const currentFriendRequests = useRef();
  const currentNewFriendRequestCount = useRef();
  const currentNewConversations = useRef();

  isDrawerOpen.current = useIsDrawerOpen();
  currentFriends.current = friendList;
  currentFriendRequests.current = friendRequestList;
  currentNewFriendRequestCount.current = newFriendRequests;
  currentNewConversations.current = newConversations;

  global.updateFriendsListWithMyNewMessage = (newPost) => {
    setFriendList((friends) => {
      return friends.map((friend) => {
        if (
          newPost.receiver === friend.receiver || newPost.receiver === friend.sender
        ) {
          friend.lastMessage = newPost.description;
          friend.lastUser = myId;
        }
        return friend;
      })
    });
  }

  useEffect(() => {
    friendList.forEach(friend => global.addConversationIds(friend.sender == myId ? friend.receiver : friend.sender));
  }, [friendList]) //we must extract just the array of ids

  const loadLastMessageAndListenForNewOnes = async (newFriend) => {
    //check if a convo already exists between the two users
    const friendlistarray = [newFriend.sender, newFriend.receiver].sort();

    const convo = await API.graphql(
      graphqlOperation(getConversation, { id: friendlistarray[0] + friendlistarray[1] })
    );

    if (convo.data.getConversation != null) {
      console.log("found old condo")
      newFriend.lastMessage = convo.data.getConversation.lastMessage
      newFriend.lastUser = convo.data.getConversation.lastUser
    } else { console.log("couldnt find condo") }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFriendList([newFriend, ...currentFriends.current]);
  }

  useEffect(() => {
    Cache.getItem("lastOnline", {
      callback: () => {
        setLastOnlineTime(-1);
      },
    }) //we'll check if this user's profile image url was stored in the cache, if not we'll look for it
      .then((time) => {
        setLastOnlineTime(time);
      });

    const receivedConversationSubscription = API.graphql(
      graphqlOperation(onCreatePostForReceiver, { receiver: myId })
    ).subscribe({
      next: (event) => {
        const newPost = event.value.data.onCreatePostForReceiver;

        global.showNotificationDot();
        setNewConversations(currentNewConversations.current + 1);

        //no need for security checks here
        setFriendList((friends) => {
          return friends.map((friend) => {
            if (
              newPost.userId === friend.sender || newPost.userId === friend.receiver
            ) {
              friend.lastMessage = newPost.description;
              friend.lastUser = newPost.userId;
              friend.isRead = null;
            }
            return friend;
          })
        });
        //foreach users in conversation, if it's not myid and it's in friend list, update friend list, and push it to the top.
        //alternatively for message screen, for each user in message screen, if it's in conversation push it to the top. otherwise just put this conversation at the top of the list.
      },
    });

    // Executes when a user receieves a friend request
    // listening for new friend requests
    const friendRequestSubscription = API.graphql(
      graphqlOperation(onCreateFriendRequestForReceiver, { receiver: myId })
    ).subscribe({
      next: (event) => {
        //IMPORTANT: don't use "friendList" or "friendRequestList" variables in this scope, instead use "currentFriends.current" and "currentFriendRequests.current"

        //console.log("is drawer open? ", isDrawerOpen.current);
        const newFriendRequest = event.value.data.onCreateFriendRequestForReceiver;
        if (newFriendRequest.sender !== myId && newFriendRequest.receiver !== myId)
          console.log("security error with incoming friend request");

        //if this new request is coming from someone already in your local friends list, remove them from your local friends list
        if (currentFriends.current.find((item) => item.sender === newFriendRequest.sender)) {
          setFriendList(
            currentFriends.current.filter(
              (item) => item.sender != newFriendRequest.sender || item.receiver != newFriendRequest.sender
            )
          );
        }

        //if this new request is not already in your local friend request list, add it to your local friend request list
        if (currentFriendRequests.current.find((item) => item.sender === newFriendRequest.sender)) {
          setFriendRequestList(
            currentFriendRequests.current.filter(
              (item) => item.sender != newFriendRequest.sender || item.receiver != newFriendRequest.sender
            ));
        }

        //if the drawer is closed, show the blue dot in the corner
        if (!isDrawerOpen.current) {
          //console.log("incrementing counter");
          global.showNotificationDot();
        }

        setNewFriendRequests(currentNewFriendRequestCount.current + 1);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setFriendRequestList([
          newFriendRequest,
          ...currentFriendRequests.current,
        ]);
      },
    });

    const friendSubscription = API.graphql(
      graphqlOperation(onAcceptedFriendship)
    ).subscribe({
      next: async (event) => {
        const newFriend = event.value.data.onAcceptedFriendship;
        //we can see all friend requests being accepted, so we just have to make sure it's one of ours.
        if (newFriend.sender === myId || newFriend.receiver === myId) {
          if (currentFriendRequests.current.find(item => item.sender === newFriend.sender || item.sender === newFriend.receiver)) {
            setFriendRequestList(
              currentFriendRequests.current.filter(
                (item) => item.sender != newFriendRequest.sender || item.receiver != newFriendRequest.sender
              ));
          }

          console.log("someone accepted us")

          if (!currentFriends.current.find(item => item.sender === newFriend.sender && item.receiver === newFriend.receiver)) {
            loadLastMessageAndListenForNewOnes(newFriend);
          }
        }

        if (global.checkFriendshipMessage !== undefined) {
          let backupConversation = await API.graphql(graphqlOperation(getConversationByUsers, { users: [newFriend.sender, newFriend.receiver].sort() }));
          console.log("Message Screen is unopened");

          backupConversation = backupConversation.data.getConversationByUsers.items[0];
          global.checkFriendshipMessage(backupConversation);
        }

        if (global.checkFriendshipMessage !== undefined && global.checkFriendshipConversation !== undefined) {
          console.log("Both the Message Screen and Conversation Screens are opened");
          let conversation = global.checkFriendshipMessage(newFriend.sender, newFriend.receiver);
          global.checkFriendshipConversation(conversation);
        }
      },
    });

    /*
    const removedFriendSubscription = API.graphql(
      graphqlOperation(onDeleteFriendship)
    ).subscribe({
      next: (event) => {
        const deletedFriend = event.value.data.onDeleteFriendship; //check the security on this one. if possible, should only fire for the sender or receiver.
        console.log("friend deleted ", deletedFriend);
        if (currentFriends.current.find(item => item.sender === deletedFriend.sender && item.sender === deletedFriend.sender)) {
          var index = currentFriends.current.findIndex(item => item.sender === deletedFriend.sender && item.sender === deletedFriend.sender);
          currentFriends.current.splice(index, 1);
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setFriendList(currentFriends.current);
        }
      },
    });
    */

    return () => {
      //removedFriendSubscription.unsubscribe();
      friendSubscription.unsubscribe();
      friendRequestSubscription.unsubscribe();
      receivedConversationSubscription.unsubscribe();
      //conversationUpdateSubscription.unsubscribe();
      currentFriendRequests.current.forEach(item => { if (item.rejected || item.accepted) confirmResponse(item); });
    };
  }, []);

  useEffect(() => {
    if (isDrawerOpen.current) {
      playSound("collapse");
      global.hideNotificationDot();
    } else {
      playSound("expand");
    }
  }, [isDrawerOpen.current]);

  const checkNewRequests = (items) => {
    items.forEach((item) => {
      if (lastOnlineTime > 0 && new Date(item.createdAt).getTime() > lastOnlineTime) {
        setNewFriendRequests(newFriendRequests + 1); //do we ever want to increase the number when loading more requests?
      }
    });
  };

  const fetchLatestMessages = async (items) => {
    let conversationIds = [];

    items.forEach((item) => {
      conversationIds.push({ id: item.sender < item.receiver ? item.sender + item.receiver : item.receiver + item.sender });
    });

    try {
      const conversations = await API.graphql(graphqlOperation(batchGetConversations, { ids: conversationIds }));
      //console.log("looking for conversations: ", conversations);
      //returns an array of like objects or nulls corresponding with the array of conversations
      for (i = 0; i < items.length; ++i) {
        if (conversations.data.batchGetConversations[i] != null) {
          console.log("found conversation");
          items[i].lastMessage = conversations.data.batchGetConversations[i].lastMessage;
          items[i].lastUser = conversations.data.batchGetConversations[i].lastUser; //could also store the index of lastuser from the users array rather than the full string
        }
      }
      return items;
    } catch (err) {
      console.log("error in getting latest messages: ", err);
    }
  };

  const respondToRequest = (item, accepted) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFriendRequestList(
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
    setFriendRequestList(
      friendRequestList.map(function (i) {
        if (i.sender == item.sender && i.receiver == item.receiver) {
          i.accepted = false;
          i.rejected = false;
        }
        return i;
      })
    ); //locally removes the item
  }

  // runs when either for accepting or rejecting a friend request
  const confirmResponse = async (item, isNew) => {
    if (friendRequestList.length == 1) playSound("celebrate");
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (isNew) setNewFriendRequests(newFriendRequests - 1);
    setFriendRequestList(
      friendRequestList.filter(
        (i) => item.sender !== i.sender || item.receiver !== i.receiver
      )
    ); //locally removes the item

    if (item.accepted && (friendList.length == 0 || !friendList.find(item1 => item1.sender == item.sender && item1.receiver == item.receiver))) {
      console.log("Inside removeFriendRequestListItem");

      var newFriend = {
        createdAt: (new Date(Date.now())).toISOString(),
        updatedAt: (new Date(Date.now())).toISOString(),
        sender: item.sender,
        receiver: item.receiver,
      };

      loadLastMessageAndListenForNewOnes(newFriend);
    }

    try {
      if (item.accepted) {

        const friend_sender = item.sender;
        const friend_receiver = item.receiver;

        let newConversations1 = await API.graphql(graphqlOperation(getConversations, { Accepted: 0 }))
        newConversations1 = newConversations1.data.getConversations.items

        let checkConversationExists = newConversations1.find(item =>
          (item.users[0] == friend_sender && item.users[1] == friend_receiver) || (item.users[0] == friend_receiver && item.users[1] == friend_sender));

        if (checkConversationExists != null) {
          channel = checkConversationExists.id;
          await API.graphql(graphqlOperation(updateConversation, { input: { id: channel, Accepted: 1 } }));
        }

        await API.graphql(
          graphqlOperation(updateFriendship, {
            input: { sender: item.sender, accepted: true }
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

  const removeFriend = async (item, blocked) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // update friendList
    setFriendList((friendList) => {
      return friendList.filter(
        (i) => i.sender !== item.sender || i.receiver !== item.receiver
      );
    });

    // delete friend object
    try {
      if (blocked) {
        global.localBlockList.push({ createdAt: (new Date(Date.now())).toISOString(), userId: myId, blockee: item.receiver == myId ? item.sender : item.receiver });
        API.graphql(
          graphqlOperation(createBlock, {
            input: { blockee: item.receiver == myId ? item.sender : item.receiver },
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
    <SafeAreaView style={{ flex: 1 }}>
      {/*Top Large Image */}
      <View
        style={{
          backgroundColor: "white",
          paddingTop: 15,
        }}
      >
        <ProfileImageAndName
          navigationObject={navigation}
          navigateToProfile={false}
          userId={myId}
          isFullSize={true}
          style={{ marginLeft: 15 }}
          textLayoutStyle={{ alignSelf: "center" }}
          textStyle={{
            fontWeight: "bold",
            fontSize: 26,
            color: "black",
            textDecorationLine: (state.routes[state.index].name === "Profile") ? "underline" : "none"
          }}
        />
      </View>

      <Accordion
        style={{ marginTop: 0 }}
        open={friendRequestList.length > 0}
        maxHeight={248}
        headerText={
          "Friend Requests" +
          (newFriendRequests > 0
            ? " (" + (newFriendRequests <= 20 ? newFriendRequests : "20+") + ")"
            : "")
        } //would be nice if we had a total friend request count. but then you'd be able to see when people revoke their friend requests.
        headerTextStyle={{
          fontSize: 18,
          color: newFriendRequests > 0 ? "blue" : "gray",
          textDecorationLine:
            friendRequestList.length > 0 ? "none" : "line-through",
        }}
        openTextColor={newFriendRequests > 0 ? "blue" : "black"}
        iconColor={newFriendRequests > 0 ? "blue" : "gray"}
        iconOpenColor={newFriendRequests > 0 ? "blue" : "black"}
        closeFunction={() => {
          friendRequestList.forEach(item => { if (item.rejected || item.accepted) confirmResponse(item); });
          setNewFriendRequests(0);
          const newlist = friendRequestList.filter((i) => !i.accepted && !i.rejected);
          setFriendRequestList(
            newlist
          );
          if (newlist.length == 0 && friendRequestList.length > 0) playSound("celebrate");
        }}
        empty={friendRequestList.length == 0}
      >
        <APIList
          style={{}}
          //initialLoadFunction={checkNewRequests}
          queryOperation={friendsByReceiver}
          filter={{
            receiver: myId, sortDirection: "DESC", filter: {
              accepted: {
                attributeExists: false,
              },
            },
          }}
          setDataFunction={setFriendRequestList}
          data={friendRequestList}
          initialAmount={21}
          additionalAmount={15}
          renderItem={({ item, index }) => (
            <FriendRequestListItem
              navigation={navigation}
              item={item}
              respondRequestHandler={respondToRequest}
              undoResponseHandler={undoResponse}
              confirmResponseHandler={confirmResponse}
              removeFriendHandler={removeFriend}
              myId={myId}
              isNew={index < newFriendRequests}
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
              }}>
              No new requests!
            </Text>
          }
        />
      </Accordion>
      <Accordion
        style={{}}
        maxHeight={248}
        open={friendList.length > 0}
        headerText={"Friends"}
        headerTextStyle={{
          fontSize: 18,
          color: "grey",
          textDecorationLine: friendList.length > 0 ? "none" : "line-through",
        }}
      >
        <APIList
          style={{}}
          queryOperation={listFriendships}
          filter={{
            filter: {
              and: [
                {
                  or: [
                    {
                      sender: {
                        eq: myId,
                      },
                    },
                    {
                      receiver: {
                        eq: myId,
                      },
                    },
                  ],
                },
                {
                  accepted: {
                    eq: true,
                  },
                },
              ]
            },
          }}
          setDataFunction={setFriendList} //a batch function should be used to grab message previews. that would also make it easy to exclude any.
          processingFunction={fetchLatestMessages}
          data={friendList}
          initialAmount={15}
          additionalAmount={15}
          renderItem={({ item }) => (
            //!item.isRead ?
            <FriendListItem
              navigation={navigation}
              removeFriendHandler={removeFriend}
              item={item}
              sidebar={true}
              friendId={item.sender === myId ? item.receiver : item.sender}
              myId={myId}
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
                marginVertical: 15,
                fontSize: 15,
              }}>
              No friends yet!
            </Text>
          }
        />
      </Accordion>
      {
        /*
       <TouchableOpacity
       style={[{
         flexDirection: "row",
         alignItems: "center",
         justifyContent: "center",
         paddingVertical: 15,
         backgroundColor: "white",
       }]}
       onPress={()=>{navigation.navigate("Message Requests")}}>
         <Text style={{
           fontSize: 18,
           color: (state.routes[state.index].name === "Message Requests") ? "black" : newConversations > 0 ? "blue" : "grey",
           textDecorationLine: (state.routes[state.index].name === "Message Requests") ? "underline" : "none",
         }}>Message Requests</Text>
       </TouchableOpacity>
       */
      }


      <TouchableOpacity
        style={[{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 15,
          backgroundColor: "white",
        }]}
        onPress={() => { setNewConversations(0); navigation.navigate("Conversations") }}>
        <Text style={{
          fontSize: 18,
          color: (state.routes[state.index].name === "Conversations") ? "black" : newConversations > 0 ? "blue" : "grey",
          textDecorationLine: (state.routes[state.index].name === "Conversations") ? "underline" : "none",
        }}>Conversations {(newConversations > 0
          ? " (" + (newConversations <= 20 ? newConversations : "20+") + ")"
          : "")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 15,
          backgroundColor: "white",
        }]}
        onPress={() => { navigation.navigate("Settings", {myId: myId}) }}>
        <Text style={{
          fontSize: 18,
          color: (state.routes[state.index].name === "Settings") ? "black" : "grey",
          textDecorationLine: (state.routes[state.index].name === "Settings") ? "underline" : "none",
        }}>Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 15,
          backgroundColor: "white",
        }]}
        onPress={() => { navigation.navigate("My Groups", {myId: myId}) }}>
        <Text style={{
          fontSize: 18,
          color: (state.routes[state.index].name === "My Groups") ? "black" : "grey",
          textDecorationLine: (state.routes[state.index].name === "My Groups") ? "underline" : "none",
        }}>My Groups</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}