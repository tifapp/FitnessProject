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

export default function GroupDescription({ setDescription, descriptionVal }) {
  return (
    <View>
      <View style={styles.boxFormat}>
        <Text>Description: </Text>
        <TextInput
          style={styles.DescriptionBox}
          multiline={true}
          onChangeText={setDescription}
          placeholder="Enter a description for your group ...."
          value={descriptionVal}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boxFormat: {
    paddingHorizontal: 8,
    paddingTop: 30,
    paddingBottom: 15,
  },
  DescriptionBox: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: "grey",
    borderRadius: 6,
    backgroundColor: "#d3d3d3",
    fontSize: 15,
    width: width / 1.3,
  },
});
