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
      }}
    >
      <ProfileImageAndName
        navigationObject={navigation}
        userId={item.sender}
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
          fontWeight: "normal",
          fontSize: 10,
          color: "gray",
        }}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-evenly",
        }}
      >
        <TouchableOpacity
          style={{ flexDirection: "column", alignItems: "center" }}
        >
          <MaterialIcons
            name="check-circle"
            style={{ marginHorizontal: 7 }}
            size={40}
            color="green"
          />
          <Text>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flexDirection: "column", alignItems: "center" }}
        >
          <MaterialIcons
            name="cancel"
            style={{ marginHorizontal: 7 }}
            size={40}
            color="red"
          />
          <Text>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
