import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Easing,
  Alert,
} from "react-native";
import { ProfileImageAndName } from "./ProfileImageAndName";
import { MaterialIcons } from "@expo/vector-icons";
import computeDistance from "hooks/computeDistance";
import getLocation from "hooks/useLocation";
import playSound from "hooks/playSound";

var styles = require("../styles/stylesheet");

export default function FriendRequestListItem({
  item,
  respondRequestHandler,
  removeFriendRequestListItemHandler,
  navigation,
  isNew,
  myId,
}) {
  const [isSelected, setIsSelected] = useState(false);
  
  const alertOptions = {
    cancelable: true,
    onDismiss: () => setIsSelected(false),
  }

  return (
    <View style={{}}>
      <ProfileImageAndName
        navigationObject={navigation}
        userId={item.sender}
        imageStyle={{
          resizeMode: "cover",
          width: 50,
          height: 50,
          borderRadius: 0,
          alignSelf: "center",
        }}
        textStyle={{
          marginLeft: 15,
          fontWeight: "normal",
          fontSize: 15,
          color:
            item.accepted || item.rejected ? "gray" : isNew ? "blue" : "black",
        }}
        textLayoutStyle={{ flex: 1, flexGrow: 1 }}
        imageOverlay={
          item.accepted ? (
            <View
              style={{
                backgroundColor: "#00ff0080",
                position: "absolute",
                top: 0,
                left: 0,
                height: 50,
                width: 50,
              }}
            >
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
            </View>
          ) : item.rejected ? (
            <View
              style={{
                backgroundColor: "#ff000080",
                position: "absolute",
                top: 0,
                left: 0,
                height: 50,
                width: 50,
              }}
            >
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
              />
            </View>
          ) : null
        }
        subtitleComponent={
          item.accepted || item.rejected ? (
            <View
              style={{
                flexDirection: "row",
                marginLeft: 12,
                justifyContent: "space-evenly",
                //flexShrink: 1
              }}
            >
              <TouchableOpacity
                style={styles.subtitleButton}
                onPress={() => {}}
              >
                <MaterialIcons
                  name="undo"
                  size={20}
                  color="black"
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={{
                    color: "black",
                    fontSize: 15,
                    fontWeight: "bold",
                  }}
                >
                  Undo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.subtitleButton}
                onPress={() => {removeFriendRequestListItemHandler(item, isNew), playSound("complete")}}
              >
                <MaterialIcons
                  name="check"
                  size={20}
                  color="blue"
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={{
                    color: "blue",
                    fontSize: 15,
                    fontWeight: "bold",
                  }}
                >
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                marginLeft: 12,
                //flexShrink: 1
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  const title = "More Options";
                  const message = "";
                  const options = [
                    {
                      text: "Block    ",
                      onPress: () => {},
                    }, //if submithandler fails user won't know
                    {
                      text: "    Cancel",
                      type: "cancel",
                      onPress: () => {
                        setIsSelected(false);
                      },
                    },
                  ];
                  Alert.alert(title, message, options, alertOptions);
                  setIsSelected(true);
                }}
                style={styles.subtitleButton}
              >
                <MaterialIcons
                  name="more-horiz"
                  size={20}
                  color={isSelected ? "black" : "gray"}
                  style={{ marginRight: 4 }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.subtitleButton}
                onPress={() => {respondRequestHandler(item, false), playSound("confirm-down")}}
              >
                <MaterialIcons
                  name="clear"
                  size={20}
                  color="red"
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={{
                    color: "red",
                    fontSize: 15,
                    fontWeight: "bold",
                  }}
                >
                  Reject
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.subtitleButton}
                onPress={() => {respondRequestHandler(item, true), playSound("confirm-up")}}
              >
                <MaterialIcons
                  name="check"
                  size={20}
                  color="green"
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={{
                    color: "green",
                    fontSize: 15,
                    fontWeight: "bold",
                  }}
                >
                  Accept
                </Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </View>
  );
}
