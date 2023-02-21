import { MaterialIcons } from "@expo/vector-icons";
import React, { ComponentProps } from "react";
import { StyleProp, Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native";

interface Props {
  onPress: () => void,
  iconName: ComponentProps<typeof MaterialIcons>['name'],
  color?: string,
  style?: StyleProp<ViewStyle>,
  label?: string,
  size?: number,
  margin?: number,
  isLabelFirst?: boolean,
  textStyle?: StyleProp<TextStyle>,
  accessibilityLabel?: string
}

export default function IconButton({
  onPress,
  iconName,
  style = {},
  color,
  label = "",
  size,
  margin = 6,
  isLabelFirst = false,
  textStyle,
  accessibilityLabel
} : Props) {
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
            {
              fontWeight: "normal",
              color: color,
              fontSize: 14,
            },
            isLabelFirst
              ? { marginRight: margin ?? 5 }
              : { marginLeft: margin ?? 5 },
            textStyle
          ]}
        >
          {label}
        </Text>
      ) : null}
      <MaterialIcons name={iconName} size={size ?? 17} color={color} accessibilityLabel={accessibilityLabel} />
    </TouchableOpacity>
  );
}
