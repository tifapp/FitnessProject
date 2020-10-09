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

var styles = require("../styles/stylesheet");

export default function ListGroupItem({ item }) {
  if (item.Privacy == "Public") {
    return (
      <View style={styles.secondaryContainerStyle}>
        <View
          style={[
            {
              flexBasis: 1,
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
              marginHorizontal: 25,
            },
            styles.check,
          ]}
        >
          <Text>{item.name}</Text>
        </View>
      </View>
    );
  } else {
    return null;
  }
}
