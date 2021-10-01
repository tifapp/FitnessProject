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
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from "@expo/vector-icons";

var styles = require("../styles/stylesheet");

export default function ListGroupItem({ item, matchingname }) {

  const navigation = useNavigation();

  const goToGroupPosts = () => {
    console.log(item);
    navigation.navigate('Group Posts Screen', {group: item, channel: item.id})
  }

  if (item.Privacy == "Public") {
    return (
      <TouchableOpacity
      style={[
        {
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
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
      onPress={goToGroupPosts}>
          <MaterialCommunityIcons name="account-group" style={{marginLeft: 20}} color={matchingname == null || matchingname ? "black" : "orange"} size={30}/>
          <Text style={
                {
                  paddingTop: 15,
                  paddingBottom: 15,
                  marginLeft: 20,
                  fontSize: 16,
                }}>{item.name}</Text>
      </TouchableOpacity>
    );
  } else {
    return null;
  }
}
