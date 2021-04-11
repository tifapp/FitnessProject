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
import { MaterialIcons } from "@expo/vector-icons";
import computeDistance from "hooks/computeDistance";
import getLocation from "hooks/useLocation";
import PostItem from "components/PostItem";

var styles = require("../styles/stylesheet");

export default function FriendListItem({
  item,
  navigation,
  removeFriendHandler,
  friendId,
  myId,
  lastMessage,
}) {
  const goToMessages = (id) => {
    if (!navigation.push)
      navigation.navigate("Messages", { userId: id });
    else navigation.push("Messages", { userId: id });
  };

  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [postVal, setPostVal] = useState("");

  const alertOptions = {
    cancelable: true,
    onDismiss: () => setIsOptionsOpen(false),
  };

  return (
    <View>
      <View
        style={[
          { flex: 1, flexDirection: "row", alignItems: "flex-start", justifyContent: "flex-start" },
          isOptionsOpen && { backgroundColor: "orange" },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            const title = "More Options";
            const message = "";
            const options = [
              {
                text: "Block",
                onPress: () => {},
              }, //if submithandler fails user won't know
              {
                text: "Unfriend",
                onPress: () => {
                  const title = "Are you sure you want to remove this friend?";
                  const options = [
                    {
                      text: "Yes",
                      onPress: () => {
                        removeFriendHandler(item), setIsOptionsOpen(false);
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
              }, //if submithandler fails user won't know
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
          }}
          style={{ alignSelf: "center", paddingHorizontal: 8 }}
        >
          <MaterialIcons
            name="more-vert"
            size={20}
            color={isOptionsOpen ? "black" : "gray"}
          />
        </TouchableOpacity>
        <ProfileImageAndName
          navigationObject={navigation}
          style={{ flex: 1 }}
          imageStyle={{
            resizeMode: "cover",
            width: 50,
            height: 50,
            alignSelf: "center",
          }}
          imageLayoutStyle={{ marginLeft: 0 }}
          textStyle={{
            fontWeight: "normal",
            fontSize: 15,
            color: "black",
          }}
          userId={friendId}
          textLayoutStyle={{ flex: 1, flexGrow: 1 }}
          subtitleComponent={
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <TouchableOpacity
                style={[styles.subtitleButton, {
                  alignItems: "flex-start",
                  paddingTop: lastMessage != null && lastMessage.length > 34 ? 0 : 8
                }]}
                onPress={() => {
                  console.log("message pressed, " + isMessageOpen);
                  goToMessages(friendId);
                }}
              >
                <Text
                  style={{
                    color: isOptionsOpen ? "black" : "blue",
                    fontSize: 15,
                    fontWeight: "bold",
                    fontStyle: lastMessage == null ? "italic" : "normal", 
                    marginRight: 10,
                  }}
                  numberOfLines={2}
                >
                <MaterialIcons
                  name="chat"
                  size={15}
                  color={isOptionsOpen ? "black" : "blue"}
                />
                  {"  " + (lastMessage == null ? "Message" : lastMessage)}
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
      <View
        style={{ height: 1, backgroundColor: "#efefef", marginHorizontal: 12 }}
      ></View>
    </View>
  );
}
