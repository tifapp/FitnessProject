import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
} from "react-native";
import StatusColors from "hooks/statusColors";
import { MaterialIcons } from "@expo/vector-icons";

export default function StatusIndicator({ status, shouldShow, isVerified }) {
  if (status || shouldShow)
    return (
      <View style={{ flexDirection: "row" }}>
        <MaterialIcons
          name={isVerified ? "check-circle" : "circle"}
          size={16}
          color={isVerified ? "black" : status ? StatusColors[status] : "gray"}
        />
        <Text
          style={{
            fontSize: 16,
            color: status ? "black" : "gray",
            marginLeft: 5,
          }}
        >{`${status ? status : "Set your status!"}`}</Text>
      </View>
    );
  else return null;
}
