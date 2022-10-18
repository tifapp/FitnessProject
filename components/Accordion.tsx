import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  LayoutAnimation,
  Text,
  TouchableWithoutFeedback,
  View
} from "react-native";

export default function Accordion(props) {
  const [open, setOpen] = useState(props.open);
  const animatedController = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open !== props.open) toggleCollapse();
  }, [props.open]);

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
      <TouchableWithoutFeedback style={{ flex: 1 }} onPress={toggleCollapse}>
        <View
          style={[
            {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              paddingVertical: 15,
              backgroundColor: "white",
            },
          ]}
        >
          <Text
            style={[
              props.headerTextStyle,
              open ? { color: props.openTextColor ?? "black" } : null,
            ]}
          >
            {props.headerText}
          </Text>
          <Animated.View style={{ transform: [{ rotateZ: arrowAngle }] }}>
            <MaterialIcons
              name="expand-more"
              size={25}
              color={
                open
                  ? props.iconOpenColor ?? "black"
                  : props.iconColor ?? "gray"
              }
            />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
      <View
        style={[
          { flex: open ? 0 : 1 },
          props.maxHeight ? { maxHeight: props.maxHeight } : null,
        ]}
      >
        {open ? (
          <View
            style={{
              height: 1,
              backgroundColor: "#efefef",
              marginHorizontal: 12,
            }}
          ></View>
        ) : null}
        {props.children}
      </View>
    </View>
  );
}
