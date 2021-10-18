import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function IconButton({ onPress, iconName, style, color, label, size, margin, isLabelFirst, fontSize, fontWeight }) {
  return (
    <TouchableOpacity
      style={[
        {
          flexDirection: isLabelFirst ? "row" : "row-reverse",
          alignItems: "center",
        },
        style
      ]}
      onPress={onPress}
    >
      {
        label ?
          <Text
            style={[
              { fontWeight: fontWeight ?? "bold", color: color, fontSize: fontSize ?? 14 },
              isLabelFirst ? {marginRight: margin ?? 5} : {marginLeft: margin ?? 5},
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
    </TouchableOpacity>
  );
}