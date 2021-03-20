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
  friendRequestsByReceiver,
  listFriendships,
  getFriendship,
  friendsBySecondUser,
  getFriendRequest,
  batchGetFriendRequests,
} from "root/src/graphql/queries";
import {
  onMyNewFriendRequests,
  onCreateFriendship,
  onDeleteFriendship,
} from "root/src/graphql/subscriptions";
import {
  createFriendRequest,
  deleteFriendRequest,
  deleteFriendship,
} from "root/src/graphql/mutations";

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

export default function CustomSidebarMenu({ navigation, state, progress, myId }) {
  const [lastOnlineTime, setLastOnlineTime] = useState(0);
  const [friendList, setFriendList] = useState([]);
  const [friendRequestList, setFriendRequestList] = useState([]);
  const [newFriendRequests, setNewFriendRequests] = useState(0); //should persist across sessions (ex. if you receive new friend requests while logged out)

  const isDrawerOpen = useRef();
  const currentFriends = useRef();
  const currentFriendRequests = useRef();
  const currentNewFriendRequestCount = useRef();
  const currentFriendRequestListRef = useRef();

  isDrawerOpen.current = useIsDrawerOpen();
  currentFriends.current = friendList;
  currentFriendRequests.current = friendRequestList;
  currentNewFriendRequestCount.current = newFriendRequests;

  useEffect(() => {
    Cache.getItem("lastOnline", {callback: ()=>{setLastOnlineTime(-1)}}) //we'll check if this user's profile image url was stored in the cache, if not we'll look for it
        .then((time) => {
          setLastOnlineTime(time);
        })
        
    const friendSubscription = API.graphql(
      graphqlOperation(onCreateFriendship)
    ).subscribe({
      next: (event) => {
        const newFriend = event.value.data.onCreateFriendship;
        if ((newFriend.user1 === myId || newFriend.user2 === myId) && (currentFriends.current.length === 0 || !currentFriends.current.find(item => item.user1 === newFriend.user1 && item.user2 === newFriend.user2))
        && (currentFriendRequests.current.length === 0 || !currentFriendRequests.current.find(item => item.sender === newFriend.user1 || item.sender === newFriend.user2))) {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setFriendList([newFriend, ...currentFriends.current]);
        }
      },
    });
    const removedFriendSubscription = API.graphql(
      graphqlOperation(onDeleteFriendship)
    ).subscribe({
      next: (event) => {
        const deletedFriend = event.value.data.onDeleteFriendship;
        console.log("friend deleted ", deletedFriend);
        if (currentFriends.current.length > 0 && currentFriends.current.find(item => item.user1 === deletedFriend.user1 && item.user2 === deletedFriend.user2)) {
          var index = currentFriends.current.findIndex(item => item.user1 === deletedFriend.user1 && item.user2 === deletedFriend.user2);
          currentFriends.current.splice(index, 1);
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setFriendList(currentFriends.current);
        }
      },
    });
    const friendRequestSubscription = API.graphql(
      graphqlOperation(onMyNewFriendRequests, { receiver: myId })
    ).subscribe({
      next: (event) => {
        //console.log("is drawer open? ", isDrawerOpen.current);
        const newFriendRequest = event.value.data.onMyNewFriendRequests;
        console.log("incoming friend request ",newFriendRequest, " my id is: ",myId);

        if ((currentFriendRequests.current.length === 0 || !currentFriendRequests.current.find(item => item.sender === newFriendRequest.sender))
        && (currentFriends.current.length === 0 || !currentFriends.current.find(item => item.user1 === newFriendRequest.sender || item.user2 === newFriendRequest.sender))) {
          //make sure it's a valid friend request

          API.graphql(
            graphqlOperation(getFriendRequest, { sender: myId, receiver: newFriendRequest.sender })
          ).then(fr => {
            if (fr.data.getFriendRequest == null) {
              if (!isDrawerOpen.current) {
                console.log("incrementing counter");
                global.incrementNotificationCount();
              }
              setNewFriendRequests(currentNewFriendRequestCount.current+1);
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setFriendRequestList([
                newFriendRequest,
                ...currentFriendRequests.current,
              ]);
            }
          });
        }
      },
    });

    return () => {
      removedFriendSubscription.unsubscribe();
      friendSubscription.unsubscribe();
      friendRequestSubscription.unsubscribe();
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

  const getNonPendingRequests = async (items) => {
    console.log("getting non pending requests");
    console.log(items);
    let senders = [];

    items.forEach((item) => {
      console.log("ANALYZING ", item)
      senders.push({
        receiver: item.sender,
      });
    });

    try {
      console.log("starting batchgetfriendrequests operation");
      const frs = await API.graphql(
        graphqlOperation(batchGetFriendRequests, {
          friendrequests: senders,
        })
      );
      console.log("finished batchgetfriendrequests operation");

      let validRequests = [];
      for (i = 0; i < items.length; ++i) {
        if (frs.data.batchGetFriendRequests[i] == null) {
          validRequests.push(items[i]);
        }
      }

      return validRequests;
    } catch (err) {
      console.log("error in getting valid friend requests: ", err);
    }
  };

  const checkNewRequests = (items) => {
    items.forEach((item) => {
      if (lastOnlineTime > 0 && new Date(item.createdAt).getTime() > lastOnlineTime) {
        setNewFriendRequests(newFriendRequests+1); //do we ever want to increase the number when loading more requests?
      }
    });
  };

  const respondToRequest = async (item, accepted) => {
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
    
    try {
      if (accepted) {
        await API.graphql(
          graphqlOperation(createFriendRequest, {
            input: { receiver: item.sender },
          })
        );
      } else {
        await API.graphql(
          graphqlOperation(deleteFriendRequest, {
            input: { sender: item.sender, receiver: item.receiver },
          })
        );
      }
    } catch (err) {
      console.log("error: ", err);
    }
  };
  
  const removeFriendRequestListItem = async (item, isNew) => {
    if (friendRequestList.length == 1) playSound("celebrate");
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (isNew) setNewFriendRequests(newFriendRequests - 1);
    setFriendRequestList(
      friendRequestList.filter(
        (i) => item.sender != i.sender || item.receiver != i.receiver
      )
    ); //locally removes the item
    if (item.accepted && (friendList.length == 0 || !friendList.find(item => item.user1 !== item.sender && item.user2 !== item.sender))) {
      setFriendList([{
        createdAt: (new Date(Date.now())).toISOString(),
        updatedAt: (new Date(Date.now())).toISOString(),
        user1: item.receiver < item.sender ? item.receiver : item.sender,
        user2: item.receiver < item.sender ? item.sender : item.receiver,
        hifives: 0
      }, ...friendList]);
    }
  };

  const removeFriend = async (item) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // update friendList
    setFriendList((friendList) => {
      return friendList.filter(
        (i) => i.user1 != item.user1 || i.user2 != item.user2
      );
    });

    // delete friend object
    try {
      await API.graphql(
        graphqlOperation(deleteFriendship, {
          input: { user1: item.user1, user2: item.user2 },
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
            fontSize: 20,
            color: (state.index === state.routes.length-1 && state.routes[state.routes.length-1].name === "Profile") ? "blue" : "black",
          }}
        />
      </View>

      <Accordion
        style={{ marginTop: 0 }}
        open={friendRequestList.length > 0}
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
          ref={currentFriendRequestListRef}
          processingFunction={getNonPendingRequests}
          //initialLoadFunction={checkNewRequests}
          queryOperation={friendRequestsByReceiver}
          filter={{ receiver: myId, sortDirection: "DESC" }}
          setDataFunction={setFriendRequestList}
          data={friendRequestList}
          initialAmount={21}
          renderItem={({ item, index }) => (
            <FriendRequestListItem
              navigation={navigation}
              item={item}
              respondRequestHandler={respondToRequest}
              removeFriendRequestListItemHandler={removeFriendRequestListItem}
              myId={myId}
              isNew={index < newFriendRequests}
            />
          )}
          keyExtractor={(item) => item.sender}
        />
      </Accordion>
      <Accordion
        style={{}}
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
              or: [
                {
                  user1: {
                    eq: myId,
                  },
                },
                {
                  user2: {
                    eq: myId,
                  },
                },
              ],
            },
          }}
          setDataFunction={setFriendList} //a batch function should be used to grab message previews. that would also make it easy to exclude any.
          data={friendList}
          renderItem={({ item }) => (
            <FriendListItem
              navigation={navigation}
              removeFriendHandler={removeFriend}
              item={item}
              myId={myId}
            />
          )}
          keyExtractor={(item) => item.createdAt.toString()}
        />
      </Accordion>
    </SafeAreaView>
  );
}