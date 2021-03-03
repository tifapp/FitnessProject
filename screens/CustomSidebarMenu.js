import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  Image,
  Text,
  Linking,
  TouchableOpacity
} from "react-native";
import { API, graphqlOperation } from "aws-amplify";
import {
  listFriendRequests,
  friendRequestsByReceiver,
  listFriendships,
  getFriendship,
  friendsBySecondUser,
  batchGetFriendRequests,
} from "root/src/graphql/queries";
import {
  onCreateFriendRequest,
  onCreateFriendship,
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

export default function CustomSidebarMenu({ navigation, myId }) {
  const [friendList, setFriendList] = useState([]);
  const [friendRequestList, setFriendRequestList] = useState([]);

  const friendRequestListRef = useRef();
  const currentFriends = useRef();
  const currentFriendRequests = useRef();

  currentFriends.current = friendList;
  currentFriendRequests.current = friendRequestList;

  useEffect(() => {
    waitForNewFriendsAsync();
  }, []);

  const waitForNewFriendsAsync = async () => {
    await API.graphql(graphqlOperation(onCreateFriendship)).subscribe({
      next: (event) => {
        const newFriend = event.value.data.onCreateFriendship;
        if (newFriend.user1 == myId || newFriend.user2 == myId) {
          setFriendList([newFriend, ...currentFriends.current]);
        }
      },
    });
    /*
        await API.graphql(graphqlOperation(onCreateFriendRequest)).subscribe({
            next: event => {
                const newFriendRequest = event.value.data.onCreateFriendRequest
                if (newFriendRequest.receiver == myId) {
                    setFriendRequestList([newFriendRequest, ...currentFriendRequests.current]);
                }
            }
        });
        */
  };

  const getNonPendingRequests = async (items) => {
    if (items != null && items.length > 0) {
      let senders = [];

      items.forEach((item) => {
        senders.push({
          receiver: item.sender,
        });
      });

      try {
        const frs = await API.graphql(
          graphqlOperation(batchGetFriendRequests, {
            friendrequests: senders,
          })
        );

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
    }
  };

  const removeFriend = async (item) => {
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
    // update friendList
    setFriendList((friendList) => {
      return friendList.filter(
        (i) => i.user1 != item.user1 || i.user2 != item.user2
      );
    });
  };

  const removeFriendHandler = (item) => {
    const title = "Are you sure you want to remove this friend?";
    const options = [
      { text: "Yes", onPress: () => removeFriend(item) },
      { text: "Cancel", type: "cancel" },
    ];
    Alert.alert(title, "", options, { cancelable: true });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/*Top Large Image */}
      <ProfileImageAndName
        navigationObject={navigation}
        you={true}
        navigation={false}
        userId={myId}
        isFull={true}
        fullname={true}
        imageStyle={{
          resizeMode: "center",
          width: 50,
          height: 50,
          borderRadius: 0,
          alignSelf: "center",
          marginTop: 0,
        }}
        textStyle={{
          marginLeft: 15,
          fontWeight: "bold",
          fontSize: 20,
          color: "gray",
        }}
      />

      <Accordion
        headerText={"Friend Requests"}
        headerTextStyle={{
          fontSize: 16,
          textAlign: "center",
          color: "blue",
          marginTop: 20,
        }}
      >
        <APIList
          style={{
          }}
          ref={friendRequestListRef}
          processingFunction={getNonPendingRequests}
          queryOperation={friendRequestsByReceiver}
          filter={{ receiver: myId }}
          setDataFunction={setFriendRequestList}
          data={friendRequestList}
          renderItem={({ item }) => (
            <FriendRequestListItem
              navigation={navigation}
              item={item}
              removeFriendHandler={removeFriendHandler}
              myId={myId}
            />
          )}
          keyExtractor={(item) => item.sender}
        />
      </Accordion>
      <Accordion
        headerText={"Friends"}
        headerTextStyle={{
          fontSize: 16,
          textAlign: "center",
          color: "grey",
          marginTop: 20,
        }}
      >
        <APIList
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
          setDataFunction={setFriendList}
          data={friendList}
          renderItem={({ item }) => (
            <FriendListItem
              navigation={navigation}
              item={item}
              removeFriendHandler={removeFriendHandler}
              myId={myId}
            />
          )}
          keyExtractor={(item) => item.createdAt.toString()}
        />
      </Accordion>
    </SafeAreaView>
  );
}