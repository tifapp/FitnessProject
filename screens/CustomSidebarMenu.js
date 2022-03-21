import { useIsDrawerOpen } from "@react-navigation/drawer";
import { API, Cache, graphqlOperation } from "aws-amplify";
import { ProfileImageAndName } from "components/ProfileImageAndName";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import {
  onAcceptedFriendship,
  onCreateFriendRequestForReceiver,
  onCreatePostForReceiver,
} from "root/src/graphql/subscriptions";
import playSound from "../hooks/playSound";

//import AsyncStorage from '@react-native-async-storage/async-storage';

global.localBlockList = [];

export default function CustomSidebarMenu({
  navigation,
  state,
  progress,
  myId,
}) {
  const [lastOnlineTime, setLastOnlineTime] = useState(0);
  const [newFriendRequests, setNewFriendRequests] = useState(0); //should persist across sessions (ex. if you receive new friend requests while logged out)
  const [newConversations, setNewConversations] = useState(0); //should persist across sessions (ex. if you receive new friend requests while logged out)

  const isDrawerOpen = useRef();
  const currentNewFriendRequestCount = useRef();
  const currentNewConversations = useRef();

  isDrawerOpen.current = useIsDrawerOpen();
  currentNewFriendRequestCount.current = newFriendRequests;
  currentNewConversations.current = newConversations;

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
        //increment notificaiton counter
      },
    });

    const friendSubscription = API.graphql(
      graphqlOperation(onAcceptedFriendship)
    ).subscribe({
      next: async (event) => {
        //increment notification coutner
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
      if (
        lastOnlineTime > 0 &&
        new Date(item.createdAt).getTime() > lastOnlineTime
      ) {
        setNewFriendRequests(newFriendRequests + 1); //do we ever want to increase the number when loading more requests?
      }
    });
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
            textDecorationLine:
              state.routes[state.index].name === "Profile"
                ? "underline"
                : "none",
          }}
        />
      </View>

      <TouchableOpacity
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 15,
            backgroundColor: "white",
          },
        ]}
        onPress={() => {
          setNewFriendRequests(0);
          navigation.navigate("Friends");
        }}
      >
        <Text
          style={{
            fontSize: 18,
            color:
              state.routes[state.index].name === "Friends"
                ? "black"
                : newConversations > 0
                ? "blue"
                : "grey",
            textDecorationLine:
              state.routes[state.index].name === "Friends"
                ? "underline"
                : "none",
          }}
        >
          Friends{" "}
          {newFriendRequests > 0
            ? " (" + (newFriendRequests <= 20 ? newFriendRequests : "20+") + ")"
            : ""}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 15,
            backgroundColor: "white",
          },
        ]}
        onPress={() => {
          setNewConversations(0);
          navigation.navigate("Conversations");
        }}
      >
        <Text
          style={{
            fontSize: 18,
            color:
              state.routes[state.index].name === "Conversations"
                ? "black"
                : newConversations > 0
                ? "blue"
                : "grey",
            textDecorationLine:
              state.routes[state.index].name === "Conversations"
                ? "underline"
                : "none",
          }}
        >
          Conversations{" "}
          {newConversations > 0
            ? " (" + (newConversations <= 20 ? newConversations : "20+") + ")"
            : ""}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 15,
            backgroundColor: "white",
          },
        ]}
        onPress={() => {
          navigation.navigate("Settings", { myId: myId });
        }}
      >
        <Text
          style={{
            fontSize: 18,
            color:
              state.routes[state.index].name === "Settings" ? "black" : "grey",
            textDecorationLine:
              state.routes[state.index].name === "Settings"
                ? "underline"
                : "none",
          }}
        >
          Settings
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 15,
            backgroundColor: "white",
          },
        ]}
        onPress={() => {
          navigation.navigate("My Groups", { myId: myId });
        }}
      >
        <Text
          style={{
            fontSize: 18,
            color:
              state.routes[state.index].name === "My Groups" ? "black" : "grey",
            textDecorationLine:
              state.routes[state.index].name === "My Groups"
                ? "underline"
                : "none",
          }}
        >
          My Groups
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
