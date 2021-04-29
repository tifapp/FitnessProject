import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  Image,
  Text,
  Linking,
  TouchableOpacity,
  LayoutAnimation,
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
  onNewFriendRequest,
  onMyNewFriendships,
  onCreateFriendship,
  onDeleteFriendship,
  onNewMessage,
} from "root/src/graphql/subscriptions";
import { deleteFriendship, updateFriendship, createBlock } from "root/src/graphql/mutations";

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
import { batchGetConversations } from "../src/graphql/queries";
import { batchGetReadReceipts } from "../src/graphql/queries";
//import AsyncStorage from '@react-native-async-storage/async-storage';

const subscriptions = [];
global.blocklist = [];

export default function CustomSidebarMenu({ navigation, state, progress, myId }) {
  const [lastOnlineTime, setLastOnlineTime] = useState(0);
  const [friendList, setFriendList] = useState([]);
  const [friendRequestList, setFriendRequestList] = useState([]);
  const [newFriendRequests, setNewFriendRequests] = useState(0); //should persist across sessions (ex. if you receive new friend requests while logged out)

  const isDrawerOpen = useRef();
  const currentFriends = useRef();
  const currentFriendRequests = useRef();
  const currentNewFriendRequestCount = useRef();

  isDrawerOpen.current = useIsDrawerOpen();
  currentFriends.current = friendList;
  currentFriendRequests.current = friendRequestList;
  currentNewFriendRequestCount.current = newFriendRequests;

  /*
  waitForFriend = API.graphql(graphqlOperation(onCreateFriendship)).subscribe({
    next: event => {
      const newFriendRequest = event.value.data.onCreateFriendship
      if (newFriendRequest.sender == userId && newFriendRequest.receiver == route.params?.id) {
        setFriendStatus("received");
      }
    }
  });

  // Case 2: Receiver accepts friend request. Update the sender's side to delete button.
  onUpdate = API.graphql(graphqlOperation(onUpdateFriendship)).subscribe({
    next: event => {
      const newFriend = event.value.data.onUpdateFriendship
      if (newFriend.sender == route.params?.id && newFriend.receiver == userId && newFriend.accepted) {
        setFriendStatus("friends");
      }
    }
  });
  */

  useEffect(() => {
    Cache.getItem("lastOnline", {
      callback: () => {
        setLastOnlineTime(-1);
      },
    }) //we'll check if this user's profile image url was stored in the cache, if not we'll look for it
      .then((time) => {
        setLastOnlineTime(time);
      });

    // Executes when a user receieves a friend request
    // listening for new friend requests
    const friendRequestSubscription = API.graphql(
      graphqlOperation(onNewFriendRequest, { receiver: myId })
    ).subscribe({
      next: (event) => {
        //IMPORTANT: don't use "friendList" or "friendRequestList" variables in this scope, instead use "currentFriends.current" and "currentFriendRequests.current"

        //console.log("is drawer open? ", isDrawerOpen.current);
        const newFriendRequest = event.value.data.onNewFriendRequest;
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
          console.log("incrementing counter");
          global.incrementNotificationCount();
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
      graphqlOperation(onMyNewFriendships)
    ).subscribe({
      next: (event) => {
        const newFriend = event.value.data.onMyNewFriendships;
        //we can see all friend requests being accepted, so we just have to make sure it's one of ours.
        if (newFriend.sender === myId || newFriend.receiver === myId) {
          if (!currentFriends.current.find(item => item.sender === newFriend.sender || item.receiver === newFriend.receiver)
          && !currentFriendRequests.current.find(item => item.sender === newFriend.sender || item.sender === newFriend.receiver)) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setFriendList([newFriend, ...currentFriends.current]);
          }
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
      subscriptions.forEach(element => {
        element.unsubscribe();
      });
      //conversationUpdateSubscription.unsubscribe();
      currentFriendRequests.current.forEach(item => {if (item.rejected || item.accepted) confirmResponse(item);});
    };
  }, []);

  useEffect(() => {
    if (isDrawerOpen.current) {
      playSound("collapse");
      global.resetNotificationCount();
    } else {
      playSound("expand");
    }
  }, [isDrawerOpen.current]);

  const checkNewRequests = (items) => {
    items.forEach((item) => {
      if (lastOnlineTime > 0 && new Date(item.createdAt).getTime() > lastOnlineTime) {
        setNewFriendRequests(newFriendRequests+1); //do we ever want to increase the number when loading more requests?
      }
    });
  };
  
  const fetchLatestMessages = async (items) => {
    subscriptions.forEach(element => {
      element.unsubscribe();
    });
    subscriptions.length = 0;

    let conversationIds = [];
    let receiptIds = [];

    items.forEach((item) => {
      conversationIds.push({id: item.sender < item.receiver ? item.sender+item.receiver : item.receiver+item.sender});
      receiptIds.push({conversationId: item.sender < item.receiver ? item.sender+item.receiver : item.receiver+item.sender});
    });
    
    try {
      const conversations = await API.graphql(graphqlOperation(batchGetConversations, { ids: conversationIds }));
      const receipts = await API.graphql(graphqlOperation(batchGetReadReceipts, { receipts: receiptIds }));
      //console.log("looking for conversations: ", conversations);
      //returns an array of like objects or nulls corresponding with the array of conversations
      for (i = 0; i < items.length; ++i) {
        //console.log("friend list item: ", items[i]);
        const friendslistarray = items[i].sender < items[i].receiver ? [items[i].sender,items[i].receiver] : [items[i].receiver,items[i].sender];
        //console.log("friend list array: ", friendslistarray);
        (async () => {
          subscriptions.push(
            await API.graphql(
              graphqlOperation(onNewMessage, {
                users: friendslistarray
              })
            ).subscribe({
              next: (event) => {
                const updatedConversation =
                  event.value.data.onNewMessage;
                console.log(
                  "new message, this is what it looks like ",
                  updatedConversation,
                  " and this is you: ",
                  myId
                );
                //no need for security checks here
                setFriendList(
                  currentFriends.current.map(function (i) {
                    if (
                      updatedConversation.users.find(
                        (user) =>
                          user !== myId &&
                          (i.sender === user || i.receiver === user)
                      )
                    ) {
                      i.lastMessage = updatedConversation.lastMessage;
                      i.lastUser = updatedConversation.lastUser;
                      i.isRead = null;
                    }
                    return i;
                  }));
                //foreach users in conversation, if it's not myid and it's in friend list, update friend list, and push it to the top.
                //alternatively for message screen, for each user in message screen, if it's in conversation push it to the top. otherwise just put this conversation at the top of the list.
              },
            })
          );
        })();

        console.log(receipts);
        if (conversations.data.batchGetConversations[i] != null) {
          console.log("found conversation");
          items[i].lastMessage = conversations.data.batchGetConversations[i].lastMessage;
          items[i].lastUser = conversations.data.batchGetConversations[i].lastUser; //could also store the index of lastuser from the users array rather than the full string

          if (receipts.data.batchGetReadReceipts[i] != null && new Date(conversations.data.batchGetConversations[i].updatedAt) < new Date(receipts.data.batchGetReadReceipts[i].updatedAt)) {
            console.log("found receipt");
            items[i].isRead = true;
          }
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

      setFriendList([{
        createdAt: (new Date(Date.now())).toISOString(),
        updatedAt: (new Date(Date.now())).toISOString(),
        sender: item.sender,
        receiver: item.receiver,
      }, ...friendList]);
    }
    
    try {
      if (item.accepted) {
        await API.graphql(
          graphqlOperation(updateFriendship, {
            input: { sender: item.sender, accepted: true}
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
        global.blocklist = [...global.blocklist, {userId: myId , blockee: item.receiver == myId ? item.sender : item.receiver}];
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
          you={true}
          navigation={false}
          userId={myId}
          isFull={true}
          fullname={true}
          textLayoutStyle={{ flex: 1 }}
          imageStyle={{
            resizeMode: "cover",
            width: 50,
            height: 50,
            borderRadius: 0,
            alignSelf: "center",
          }}
          textStyle={{
            fontWeight: "bold",
            fontSize: 26,
            color: (state.index === state.routes.length-1 && state.routes[state.routes.length-1].name === "Profile") ? "blue" : "black",
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
          friendRequestList.forEach(item => {if (item.rejected || item.accepted) confirmResponse(item);});
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
          filter={{ receiver: myId, sortDirection: "DESC", filter: {
                accepted: {
                  attributeExists: false,
                },
          }, }}
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
            <FriendListItem
              navigation={navigation}
              removeFriendHandler={removeFriend}
              item={item}
              friendId={item.sender === myId ? item.receiver : item.sender}
              myId={myId}
              lastMessage={item.lastMessage}
              lastUser={item.lastUser}
            />
          )}
          keyExtractor={(item) => item.createdAt.toString()}
        />
      </Accordion>
      <TouchableOpacity
      onPress={()=>{navigation.navigate("Conversations")}}>
        <Text>Conversations</Text>
      </TouchableOpacity>
      <TouchableOpacity
      onPress={()=>{navigation.navigate("Settings"), {blocklist: global.blocklist}}}>
        <Text>Settings</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}