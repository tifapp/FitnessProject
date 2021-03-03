import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ProfileImageAndName } from "./ProfileImageAndName";
import { AntDesign } from "@expo/vector-icons";
import computeDistance from "hooks/computeDistance";
import getLocation from "hooks/useLocation";

var styles = require("../styles/stylesheet");

export default function FriendListItem({ item, navigation, removeFriendHandler, myId }) {
  const findFriendID = (item) => {
    if (myId == item.user1) return item.user2;
    if (myId == item.user2) return item.user1;
  };
  
  const goToMessages = (item) => {
    navigation.navigate("Messages", { userId: item });
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 5,
        justifyContent: "space-between",
        width: "80%",
      }}
    >
      <ProfileImageAndName
        navigationObject={navigation}
        imageStyle={{
          resizeMode: "center",
          width: 100,
          height: 100,
          borderRadius: 0,
          alignSelf: "center",
          marginTop: 20,
        }}
        userId={findFriendID(item)}
      />
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginHorizontal: 15,
        }}
        onPress={() => removeFriendHandler(item)}
      >
        <Text>Remove</Text>
        <Entypo
          name="cross"
          style={{ marginHorizontal: 7 }}
          size={44}
          color="red"
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.unselectedButtonStyle, { borderColor: "blue" }]}
        color="orange"
        onPress={() => goToMessages(findFriendID(item))}
      >
        <Text style={[styles.unselectedButtonTextStyle, { color: "blue" }]}>
          Message
        </Text>
      </TouchableOpacity>
    </View>
  );
}
