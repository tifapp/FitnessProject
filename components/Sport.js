import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
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
  Picker,
  Keyboard,
  Modal,
  Dimensions,
} from "react-native";
import { withAuthenticator } from "aws-amplify-react-native";
// Get the aws resources configuration parameters
import { Amplify, API, graphqlOperation, Auth } from "aws-amplify";
import awsconfig from "../aws-exports"; // if you are using Amplify CLI

const { width } = Dimensions.get("screen");

export default function SportCreation({ setSport, sportVal }) {
  return (
    <View>
      <View style={styles.nameFormat}>
        <Text>Sport: </Text>
        <TextInput
          multine="true"
          onChangeText={setSport}
          placeholder="Enter your sport..."
          value={sportVal}
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
    width: width / 1.3
  },
});
