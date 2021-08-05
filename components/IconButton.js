import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function IconButton({ onPress, iconName, style, color, label, size, isLabelFirst }) {
  return (
    <TouchableOpacity
      style={[
        {
          flex: 1,
          flexDirection: "row",
          paddingHorizontal: 15,
          paddingTop: 15,
        },
        style
      ]}
      onPress={onPress}
    >
      {
        isLabelFirst && label ?
          <Text
            style={[
              { fontWeight: "bold", color: color },
            ]}
          >
            {label}
          </Text> : null
      }
      <MaterialIcons
        name={iconName}
        size={size ?? 17}
        color={color}
      />
      {
        isLabelFirst && label ?
          null : <Text
            style={[
              { fontWeight: "bold", color: color },
            ]}
          >
            {label}
          </Text>
      }
    </TouchableOpacity>
  );
}