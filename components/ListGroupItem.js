import React, { useState } from "react";
import { Storage } from "aws-amplify";
import {
  StyleSheet,
  View,
  Button,
  Image,
  TextInput,
  Text,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

var styles = require("../styles/stylesheet");

export default function ListGroupItem({ item, matchingname }) {
  const navigation = useNavigation();

  const goToGroupPosts = () => {
    console.log(item);
    navigation.navigate("Group Posts Screen", {
      group: item,
      channel: item.id,
    });
  };

  if (item.Privacy == "Public") {
    return (
      <TouchableOpacity
        style={[
          {
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            marginHorizontal: 20,
            marginTop: 20,
            backgroundColor: "white",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.18,
            shadowRadius: 1.0,

            elevation: 1,
          },
        ]}
        onPress={goToGroupPosts}
      >
        <View
          style={{ flexDirection: "row", alignItems: "center", paddingTop: 10 }}
        >
          <MaterialCommunityIcons
            name="account-group"
            style={{ marginLeft: 20 }}
            color={matchingname == null || matchingname ? "black" : "#a9efe0"}
            size={30}
          />
          <Text
            style={{
              marginLeft: 20,
              fontSize: 16,
            }}
          >
            {item.name}
          </Text>
        </View>
        {item.Description.length > 0 ? (
          <Text
            style={{
              paddingTop: 7,
              paddingBottom: 15,
              marginLeft: 20,
              marginRight: 20,
              fontSize: 12,
            }}
            numberOfLines={1}
          >
            "{item.Description}"
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  } else {
    return null;
  }
}
