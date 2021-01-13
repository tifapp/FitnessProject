import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { createGroup } from "../src/graphql/mutations";
import {
  StyleSheet,
  Text,
  Button,
  Image,
  View,
  TextInput,
  TouchableOpacity,
  Linking,
  ScrollView,
  Keyboard,
  Modal,
  Dimensions,
} from "react-native";
import { withAuthenticator } from "aws-amplify-react-native";
// Get the aws resources configuration parameters
import { Amplify, API, graphqlOperation, Auth } from "aws-amplify";
import awsconfig from "../aws-exports"; // if you are using Amplify CLI

export default function MaxUsers({ setTotalUsers, totalUsersVal }) {
  return (
    <View>
      <View style={styles.nameFormat}>
        <Text>Max amount of Users: </Text>
        <TextInput
          multine="true"
          onChangeText={setTotalUsers}
          keyboardType={"numeric"}
          placeholder="Enter # of users"
          value={totalUsersVal}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nameFormat: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    paddingTop: 30,
    paddingBottom: 15,
  },
});
