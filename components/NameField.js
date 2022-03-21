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

const { width } = Dimensions.get("screen");

export default function NameField({ setName, nameVal }) {
  return (
    <View>
      <View style={styles.nameFormat}>
        <Text>Name: </Text>
        <TextInput
          multine="true"
          placeholder="Enter your name ..."
          onChangeText={setName}
          value={nameVal}
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
    width: width / 1.3,
  },
});
