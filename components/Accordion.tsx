import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  LayoutAnimation, StyleProp, Text, TextStyle, TouchableWithoutFeedback,
  View,
  ViewProps
} from "react-native";

interface Props extends ViewProps {
  initialOpen: boolean,
  headerText: string,
  headerTextStyle: StyleProp<TextStyle>,
  maxHeight?: number,
  openTextColor: string,
  iconColor: string,
  iconOpenColor: string,
  empty: boolean,
  closeFunction?: () => void,
  openFunction?: () => void
} 

export default function Accordion({initialOpen, headerText, headerTextStyle, openTextColor, iconColor, maxHeight, iconOpenColor, empty, children, style, openFunction, closeFunction} : Props) {
  const [open, setOpen] = useState(initialOpen);
  const animatedController = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open !== initialOpen) toggleCollapse();
  }, [initialOpen]);

  const arrowAngle = animatedController.interpolate({
    inputRange: [0, 1],
    outputRange: ["0rad", `${Math.PI}rad`],
  });

  const toggleCollapse = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (open) {
      closeFunction?.();
      Animated.timing(animatedController, {
        duration: 250,
        toValue: 0,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }).start();
    } else {
      openFunction?.();
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
    <View style={style}>
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
              headerTextStyle,
              open ? { color: openTextColor ?? "black" } : null,
            ]}
          >
            {headerText}
          </Text>
          <Animated.View style={{ transform: [{ rotateZ: arrowAngle }] }}>
            <MaterialIcons
              name="expand-more"
              size={25}
              color={
                open
                  ? iconOpenColor ?? "black"
                  : iconColor ?? "gray"
              }
            />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
      <View
        style={[
          { flex: open ? 0 : 1 },
          maxHeight ? { maxHeight } : null,
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
        {children}
      </View>
    </View>
  );
}
