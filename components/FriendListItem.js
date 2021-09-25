import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  LayoutAnimation,
} from "react-native";
import { ProfileImageAndName } from "./ProfileImageAndName";
import IconButton from "./IconButton";
import { MaterialIcons } from "@expo/vector-icons";
import computeDistance from "hooks/computeDistance";
import getLocation from "hooks/useLocation";
import PostItem from "components/PostItem";
import { CommonActions } from '@react-navigation/native';

var styles = require("../styles/stylesheet");

export default function FriendListItem({
  item,
  navigation,
  removeFriendHandler,
  deleteConversationFromConvo,
  friendId,
  myId,
  lastMessage,
  lastUser,
  Accepted,
  sidebar
}) {

  const goToMessages = (id, Accepted, lastUser, sidebar) => {
    if (!navigation.push)
      navigation.navigate(id, { Accepted: Accepted, lastUser: lastUser, sidebar: sidebar, id: item.id });
    else navigation.push(id, { Accepted: Accepted, lastUser: lastUser, sidebar: sidebar, id: item.id });
  };

  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [postVal, setPostVal] = useState("");

  const alertOptions = {
    cancelable: true,
    onDismiss: () => setIsOptionsOpen(false),
  };

  const openOptionsDialog = () => {
    const title = "More Options";
    const message = "";
    const options = [
      {
        text: "Block",
        onPress: () => {
          const title = "Are you sure you want to block this friend? This will unfriend them and delete all messages.";
          const options = [
            {
              text: "Yes",
              onPress: () => {
                removeFriendHandler(item, true), setIsOptionsOpen(false);
              },
            },
            {
              text: "Cancel",
              type: "cancel",
              onPress: () => {
                setIsOptionsOpen(false);
              },
            },
          ];
          Alert.alert(title, "", options, alertOptions);
        },
      },
      deleteConversationFromConvo != undefined ?
        {
          text: "Delete Conversation",
          onPress: () => {
            const title = "Are you sure you want to delete this conversation? This will delete all messages.";
            const options = [
              {
                text: "Yes",
                onPress: () => {
                  console.log("Test");
                  deleteConversationFromConvo(item, friendId), setIsOptionsOpen(false)
                },
              },
              {
                text: "Cancel",
                type: "cancel",
                onPress: () => {
                  setIsOptionsOpen(false);
                },
              },
            ];
            Alert.alert(title, "", options, alertOptions);
          },
        } :
        {
          text: "Unfriend",
          onPress: () => {
            const title = "Are you sure you want to remove this friend? This will delete all messages.";
            const options = [
              {
                text: "Yes",
                onPress: () => {
                  removeFriendHandler(item), setIsOptionsOpen(false)
                },
              },
              {
                text: "Cancel",
                type: "cancel",
                onPress: () => {
                  setIsOptionsOpen(false);
                },
              },
            ];
            Alert.alert(title, "", options, alertOptions);
          },
        }
      , //if submithandler fails user won't know
      {
        text: "Cancel",
        type: "cancel",
        onPress: () => {
          setIsOptionsOpen(false);
        },
      },
    ];
    Alert.alert(title, message, options, alertOptions);
    setIsOptionsOpen(true);
  }

  return (
    <View>
      <View
        style={[
          { flex: 1, flexDirection: "row", alignItems: "flex-start", justifyContent: "flex-start" },
          isOptionsOpen && { backgroundColor: "orange" },
        ]}
      >
        <IconButton
          iconName={"more-vert"}
          size={20}
          color={isOptionsOpen ? "black" : "gray"}
          onPress={openOptionsDialog}
          style={{ alignSelf: "center", paddingHorizontal: 8 }}
        />
        <ProfileImageAndName
          navigationObject={navigation}
          style={{ flex: 1, marginVertical: 15 }}
          textStyle={{
            fontWeight: "bold",
            fontSize: 16,
            color: "black",
            textDecorationLine: 'underline'
          }}
          userId={friendId}
          textLayoutStyle={{ flex: 1, flexGrow: 1 }}
          subtitleComponent={
            <TouchableOpacity
              style={[styles.subtitleButton, {
                alignItems: "flex-start",
              }]}
              onPress={() => {
                console.log("message pressed, " + isMessageOpen);
                item.isRead = true;
                goToMessages(friendId, Accepted, lastUser, sidebar);
              }}
            >
              <Text
                style={{
                  color: isOptionsOpen ? "black" : item.isRead || lastUser == myId ? "black" : "blue",
                  fontSize: 15,
                  fontWeight: item.isRead || lastUser == myId ? "normal" : "bold",
                  fontStyle: lastMessage == null ? "italic" : "normal",
                  marginRight: 10,
                }}
                numberOfLines={2}
              >
                {
                  lastUser == myId ? null :
                    <MaterialIcons
                      name={item.isRead ? "messenger-outline" : "messenger"}
                      size={15}
                      color={isOptionsOpen ? "black" : item.isRead || lastUser == myId ? "black" : "blue"}
                    />
                }
                {
                  lastUser == myId ?
                    "You: " :
                    item.isRead ?
                      "  " :
                      "  "
                }
                {(lastMessage == null ? "Message" : lastMessage)}
              </Text>
            </TouchableOpacity>
          }
        />
      </View>
      <View
        style={{ height: 1, backgroundColor: "#efefef", marginHorizontal: 12 }}
      ></View>
    </View>
  );
}
