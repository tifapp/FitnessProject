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

import * as Haptics from "expo-haptics";
import playSound from "hooks/playSound";
import { useNavigation } from "@react-navigation/native";

import { MaterialIcons } from "@expo/vector-icons";

export default function DrawerButton(props) {
  const navigation = useNavigation();

  const [notificationCount, setNotificationCount] = useState(0);

  global.showNotificationDot = () => {
    setNotificationCount(notificationCount + 1);
  };

  global.hideNotificationDot = () => {
    setNotificationCount(0);
  };

  //should separate drawer and search buttons into their own components
  //search button should accept an argument that changes what the default tab is for the friends and groups screens
  return (
    <View style={{ flexDirection: "row" }}>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("Search");
        }}
      >
        <MaterialIcons
          name={"search"}
          size={30}
          color={"black"}
          style={{ paddingRight: 15 }}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={navigation.toggleDrawer}>
        <MaterialIcons
          name="menu"
          size={30}
          color={"black"}
          style={{ paddingRight: 15 }}
        />

        {notificationCount > 0 ? (
          <>
            <MaterialIcons
              name="circle"
              size={19}
              color={"red"}
              style={{ position: "absolute", top: -2, right: 9 }}
            />
            <Text
              style={{
                position: "absolute",
                top: 0,
                right: 14,
                fontWeight: "bold",
                color: "white",
                fontSize: 12,
              }}
            >
              {notificationCount}
            </Text>
          </>
        ) : null}
      </TouchableOpacity>
    </View>
  );
}
