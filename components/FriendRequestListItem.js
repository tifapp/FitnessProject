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
  removeFriendHandler,
  navigation,
  isNew,
  myId,
}) {
  const [isSelected, setIsSelected] = useState(false);

  const alertOptions = {
    cancelable: true,
    onDismiss: () => setIsSelected(false),
  };

  return (
    <View style={{}}>
      <View
        style={[
          { flexDirection: "row", alignItems: "flex-start" },
          isSelected && { backgroundColor: "orange" },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            const title = "More Options";
            const message = "";
            const options = [
              {
                text: "Block",
                onPress: () => {
                  const title = "Are you sure you want to block this friend? This will stop them from messaging you and sending you friend requests.";
                  const options = [
                    {
                      text: "Yes",
                      onPress: () => {
                        removeFriendHandler(item, true), confirmResponseHandler(item, isNew);
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
          }}
          style={{ alignSelf: "center", paddingHorizontal: 8 }}
        >
          <MaterialIcons
            name="more-vert"
            size={20}
            color={isSelected ? "black" : "gray"}
          />
        </TouchableOpacity>
        <ProfileImageAndName
          navigationObject={navigation}
          style={{ flex: 1 }}
          userId={item.sender}
          imageStyle={{
            resizeMode: "cover",
            width: 50,
            height: 50,
            borderRadius: 0,
            alignSelf: "center",
          }}
          imageLayoutStyle={{ marginLeft: 0 }}
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
                height: 50,
                width: 50,
              }}
            > {
                item.accepted ?
                  <MaterialIcons
                    name="check"
                    size={40}
                    color="white"
                    style={{
                      position: "absolute",
                      top: 5,
                      left: 5,
                      alignItems: "center",
                    }}
                  />
                  : item.rejected ?
                    <MaterialIcons
                      name="clear"
                      size={40}
                      color="white"
                      style={{
                        position: "absolute",
                        top: 5,
                        left: 5,
                        alignItems: "center",
                      }}
                    /> : null
              }
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
