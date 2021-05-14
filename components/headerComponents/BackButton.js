import React, { useState, useEffect, useRef, PureComponent } from "react";
import {
  TouchableOpacity,
  Text,
  View
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from "@expo/vector-icons";
import { useIsDrawerOpen } from '@react-navigation/drawer';

export default function DrawerButton(props) {
  const navigation = useNavigation();
  const isDrawerOpen = useIsDrawerOpen();
  
  return (
    navigation.canGoBack() && !isDrawerOpen ? (
      <TouchableOpacity onPress={navigation.goBack} style={{ flexDirection: "row", alignItems: "center" }}>
        <MaterialIcons
          name="arrow-back"
          size={30}
          color={"black"}
          style={{ paddingLeft: 10 }}
        />
        <Text style={{ paddingLeft: 5, fontSize: 15, fontWeight: "bold" }}>Feed</Text>
      </TouchableOpacity>
    ) : null
  );
}
