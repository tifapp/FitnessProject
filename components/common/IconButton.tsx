import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

interface Props {
  onPress: () => {},
  iconName: string,
  color: string,
  style: Object,
  label: string,
  size: number,
  margin: number,
  isLabelFirst: boolean,
  fontSize: number,
  fontWeight: string,
}

export default function IconButton({
  onPress = () => {},
  iconName,
  style = {},
  color,
  label = "",
  size,
  margin = 6,
  isLabelFirst = false,
  fontSize = 14,
  fontWeight = "normal",
}) {
  return (
    <TouchableOpacity
      style={[
        {
          flexDirection: isLabelFirst ? "row" : "row-reverse",
          alignItems: "center",
        },
        style,
      ]}
      onPress={onPress}
    >
      {label ? (
        <Text
          style={[
            // @ts-ignore
            {
              fontWeight: fontWeight,
              color: color,
              fontSize: fontSize,
            },
            isLabelFirst
              ? { marginRight: margin ?? 5 }
              : { marginLeft: margin ?? 5 },
          ]}
        >
          {label}
        </Text>
      ) : null}
      <MaterialIcons name={iconName} size={size ?? 17} color={color} />
    </TouchableOpacity>
  );
}
