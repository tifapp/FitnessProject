import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function IconButton({ onPress, iconName, style, color, label, size, margin, isLabelFirst, fontSize }) {
  return (
    <TouchableOpacity
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
        },
        style
      ]}
      onPress={onPress}
    >
      {
        isLabelFirst && label ?
          <Text
            style={[
              { fontWeight: "bold", color: color, marginRight: margin ?? 5, fontSize: fontSize ?? 14 },
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
        !isLabelFirst && label ?
          <Text
            style={[
              { fontWeight: "bold", color: color, marginLeft: margin ?? 5, fontSize: fontSize ?? 14 },
            ]}
          >
            {label}
          </Text>
          : null
      }
    </TouchableOpacity>
  );
}