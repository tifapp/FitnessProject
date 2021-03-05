import React, { useState, useEffect, useRef, PureComponent } from "react";
import {
  StyleSheet,
  View,
  Button,
  Image,
  TextInput,
  Text,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  UIManager,
  Easing,
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import * as Haptics from "expo-haptics";

var styles = require("../styles/stylesheet");

export default function Accordion(props) {
  const [open, setOpen] = useState(false);
  const animatedController = useRef(new Animated.Value(0)).current;

  const arrowAngle = animatedController.interpolate({
    inputRange: [0, 1],
    outputRange: ["0rad", `${Math.PI}rad`],
  });

  const toggleCollapse = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (open) {
      if (props.closeFunction != null) props.closeFunction();
      Animated.timing(animatedController, {
        duration: 250,
        toValue: 0,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }).start();
    } else {
      if (props.openFunction != null) props.openFunction();
      Animated.timing(animatedController, {
        duration: 250,
        toValue: 1,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }).start();
    }
    setOpen(!open);
  };

  return (
    <View style={props.style}>
      <TouchableWithoutFeedback style={{flex: 1}} onPress={toggleCollapse}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={[props.headerTextStyle, open ? { color: "black" } : null]}
          >
            {props.headerText}
          </Text>
          <Animated.View style={{ transform: [{ rotateZ: arrowAngle }] }}>
            <MaterialIcons
              name="arrow-drop-down"
              size={30}
              color={open ? "black" : props.iconColor ?? "gray"}
            />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
      <View style={{ flex: open ? 0 : 1 }}>
        {props.empty ? (
          <View style={{height: 25}}>
          </View>
        ) : (
          props.children
        )}
      </View>
    </View>
  );
}
