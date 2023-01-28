import MainStack from "@stacks/MainStack";
import { Auth } from "aws-amplify";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import FeedScreen from "./FeedScreen";

const ActivitiesScreen = () => {
  function signOut() {
    const title = "Are you sure you want to sign out?";
    const message = "";
    Alert.alert(title, message, [
      {
        text: "Yes",
        onPress: () => {
          Auth.signOut();
        },
      }, //if submithandler fails user won't know
      { text: "Cancel", style: "cancel" },
    ], { cancelable: true });
  }

  return (
  <View style={{
    flex:1,
    justifyContent: "center",
    alignItems: "center"
    }}>
    <TouchableOpacity onPress={signOut}>
      <Text
        style={{
          fontSize: 15,
          margin: 20,
        }}
      >
        Log Out
      </Text>
    </TouchableOpacity>
    
    <Text
        style={{
          alignItems: "center",
          justifyContent: "center",
          color: "black",
          fontWeight: "bold",
          fontSize: 15
        }}
      >
        SandBox to get started
      </Text>
  </View>
  );
};

export default ActivitiesScreen;
