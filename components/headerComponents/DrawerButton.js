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

import { MaterialIcons } from "@expo/vector-icons";

export default function DrawerButton(props) {
  //Structure for the navigatin Drawer
  const toggleDrawer = () => {
    //Props to open/close the drawer
    props.navigationProps.toggleDrawer();
  };

  const [notificationCount, setNotificationCount] = useState(0);

  global.incrementNotificationCount = () => {
    setNotificationCount(notificationCount + 1);
  };

  global.resetNotificationCount = () => {
    setNotificationCount(0);
  };
  
  return (
    <View style={{ flexDirection: "row" }}>
      <TouchableOpacity onPress={toggleDrawer}>
        <MaterialIcons
          name="menu"
          size={30}
          color={"black"}
          style={{ paddingLeft: 15 }}
        />
        {notificationCount > 0 ? (
          <MaterialIcons name="circle" size={10} color={"red"} style={{position: "absolute", top: -2, right: -6}} />
        ) : null}
      </TouchableOpacity>
    </View>
  );
}
