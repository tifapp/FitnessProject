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

import { MaterialIcons } from "@expo/vector-icons";

export default function DrawerButton (props) {
  //Structure for the navigatin Drawer
  const toggleDrawer = () => {
    //Props to open/close the drawer
    props.navigationProps.toggleDrawer();
  };

  return (
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity onPress={toggleDrawer}>
        <MaterialIcons name="menu" size={30} color="black" style={{paddingLeft: 15}} />
      </TouchableOpacity>
    </View>
  );
};