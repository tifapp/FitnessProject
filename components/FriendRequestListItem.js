import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ProfileImageAndName } from "./ProfileImageAndName";
import { MaterialIcons } from "@expo/vector-icons";
import computeDistance from "hooks/computeDistance";
import getLocation from "hooks/useLocation";

var styles = require("../styles/stylesheet");

export default function FriendListItem({ item, navigation, myId }) {

  console.log("rendering a friend request");

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <ProfileImageAndName
        navigationObject={navigation}
        userId={item.sender}
        imageStyle={{
          resizeMode: "cover",
          width: 50,
          height: 50,
          borderRadius: 0,
          alignSelf: "center",
          marginTop: 0,
        }}
        textStyle={{
          marginLeft: 15,
          fontWeight: "normal",
          fontSize: 15,
          color: "black",
        }}
        subtitleComponent={
          <View
            style={{
              flexDirection: "row",
              //justifyContent: "space-between",
              //flexShrink: 1
            }}
          >
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
              }}
            >
              <MaterialIcons name="check" size={20} color="green" style={{marginRight: 4}} />
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

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
              }}
            >
              <MaterialIcons name="clear" size={20} color="red" style={{marginRight: 5}} />
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
          </View>
        }
      />
    </View>
  );
}
