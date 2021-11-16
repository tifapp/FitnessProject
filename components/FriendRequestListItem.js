import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { ProfileImageAndName } from "./ProfileImageAndName";
import IconButton from "./IconButton";
import { MaterialIcons } from "@expo/vector-icons";
import playSound from "hooks/playSound";

var styles = require("../styles/stylesheet");

export default function FriendRequestListItem({
  item,
  respondRequestHandler,
  confirmResponseHandler,
  undoResponseHandler,
  navigation,
  isNew,
  myId,
}) {
  const [isSelected, setIsSelected] = useState(false);

  const alertOptions = {
    cancelable: true,
    onDismiss: () => setIsSelected(false),
  };
  
  const openOptionsDialog = () => {
    const title = "More Options";
    const message = "";
    const options = [
      {
        text: "Block",
        onPress: () => {
          const title = "Are you sure you want to block this friend? This will unfriend them and stop them from sending you messages and friend requests.";
          const options = [
            {
              text: "Yes",
              onPress: () => {
                confirmResponseHandler(item, isNew);
              },
            },
            {
              text: "Cancel",
              type: "cancel",
              onPress: () => {
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
          setIsSelected(false);
        },
      },
    ];
    Alert.alert(title, message, options, alertOptions);
    setIsSelected(true);
  }

  return (
    <View style={{}}>
      <View
        style={[
          { flexDirection: "row", alignItems: "flex-start" },
          isSelected && { backgroundColor: "orange" },
        ]}
      >
        <IconButton
          iconName={"more-vert"}
          size={20}
          color={isSelected ? "black" : "gray"}
          onPress={openOptionsDialog}
          style={{ alignSelf: "center", paddingHorizontal: 8 }}
        />
        <ProfileImageAndName
          navigationObject={navigation}
          style={{ flex: 1, marginVertical: 15 }}
          userId={item.sender}
          textStyle={{
            fontWeight: "normal",
            fontSize: 15,
            color:
              item.accepted || item.rejected
                ? "gray"
                : isNew
                  ? "blue"
                  : "black",
          }}
          textLayoutStyle={{ flex: 1, flexGrow: 1 }}
          imageOverlay={
            item.accepted || item.rejected ?
            <View
              style={{
                backgroundColor: item.accepted ? "#00ff0080" : "#ff000080",
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: "100%",
              }}
            >
              <MaterialIcons
                name={item.accepted ? "check" : "clear"}
                size={40}
                color="white"
                style={{
                  position: "absolute",
                  top: 5,
                  left: 5,
                  alignItems: "center",
                }}
              />
            </View>
            : null
          }
          subtitleComponent={
            item.accepted || item.rejected ? (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  //flexShrink: 1
                }}
              >
                <IconButton
                  style={{marginLeft: 15}}
                  iconName={"undo"}
                  size={20}
                  color={"black"}
                  onPress={() => undoResponseHandler(item)}
                  label={"Undo"}
                />
                <IconButton
                  iconName={"check"}
                  size={20}
                  color={"blue"}
                  onPress={() => {confirmResponseHandler(item, isNew), playSound("complete")}}
                  label={"Done"}
                />
              </View>
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  //flexShrink: 1
                }}
              >
                <IconButton
                  style={{marginLeft: 15}}
                  iconName={"clear"}
                  size={20}
                  color={"red"}
                  onPress={() => {respondRequestHandler(item, false), playSound("confirm-down")}}
                  label={"Reject"}
                />
                <IconButton
                  iconName={"check"}
                  size={20}
                  color={"green"}
                  onPress={() => {respondRequestHandler(item, true), playSound("confirm-up")}}
                  label={"Accept"}
                />
              </View>
            )
          }
        />
      </View>
      <View
        style={{ height: 1, backgroundColor: "#efefef", marginHorizontal: 12 }}
      ></View>
    </View>
  );
}
