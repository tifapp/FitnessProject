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
  Easing,
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import * as Haptics from "expo-haptics";

var styles = require("../styles/stylesheet");

export default function Accordion(props) {
  const [open, setOpen] = useState(false);
  const animatedController = useRef(new Animated.Value(0)).current;
  const [bodySectionHeight, setBodySectionHeight] = useState(0);

  const bodyHeight = animatedController.interpolate({
    inputRange: [0, 1],
    outputRange: [0, bodySectionHeight],
  });

  const arrowAngle = animatedController.interpolate({
    inputRange: [0, 1],
    outputRange: ["0rad", `${Math.PI}rad`],
  });

  const toggleListItem = () => {
    if (open) {
      Animated.timing(animatedController, {
        duration: 250,
        toValue: 0,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: false, // Add this line
      }).start();
    } else {
      Animated.timing(animatedController, {
        duration: 250,
        toValue: 1,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: false, // Add this line
      }).start();
    }
    setOpen(!open);
  };

  return (
    <View style={[styles.secondaryContainerStyle, { backgroundColor: "#fff" }]}>
      <TouchableWithoutFeedback
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        onPress={toggleListItem}
      >
        <View>
          <Text
            style={props.headerTextStyle}
          >
            {props.headerText}
          </Text>
          <Animated.View style={{ transform: [{ rotateZ: arrowAngle }] }}>
            <MaterialIcons name="keyboard-arrow-down" size={20} color="grey" />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
      <Animated.View style={{ overflow: "hidden", height: bodyHeight }}>
        <View
          onLayout={(event) =>
            setBodySectionHeight(event.nativeEvent.layout.height)
          }
          style={{ position: "absolute", bottom: 0 }}
        >
          {props.children}
        </View>
      </Animated.View>
    </View>
  );
}
