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

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Accordion(props) {
  const [savedChildrenState, setSavedChildrenState] = useState(null);
  const [savedChildren, setSavedChildren] = useState(null);
  const [open, setOpen] = useState(false);
  const animatedController = useRef(new Animated.Value(0)).current;

  const arrowAngle = animatedController.interpolate({
    inputRange: [0, 1],
    outputRange: ["0rad", `${Math.PI}rad`],
  });

  const toggleCollapse = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (open) {
      Animated.timing(animatedController, {
        duration: 250,
        toValue: 0,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }).start();
    } else {
      const childrenWithProps = React.Children.map(props.children, child => {
        // checking isValidElement is the safe way and avoids a typescript error too
        if (React.isValidElement(child)) {
           //so we can only save the state of one child at a time
          return React.cloneElement(child, {saveState: setSavedChildrenState, initialState: savedChildrenState});
        }
        return child;
      });
  
      setSavedChildren(childrenWithProps);

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
    <View>
      <TouchableWithoutFeedback
        onPress={toggleCollapse}
      >
        <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Text style={props.headerTextStyle}>{props.headerText}</Text>
          <Animated.View style={{ transform: [{ rotateZ: arrowAngle }] }}>
            <MaterialIcons name="arrow-drop-down" size={30} color="grey" />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
      <View>
        {open ? savedChildren : null}
      </View>
    </View>
  );
}
