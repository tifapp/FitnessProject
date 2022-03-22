import BackButton from "@components/headerComponents/BackButton";
import DrawerButton from "@components/headerComponents/DrawerButton";
import React from "react";
import { Platform } from "react-native";

export const headerOptions = {
  headerLeft: (props) => <BackButton {...props} />,
  headerRight: (props) => <DrawerButton {...props} />,
  headerStyle: { backgroundColor: "#a9efe0" },
  headerTintColor: "#000",
  headerTitleStyle: {
    fontWeight: Platform.OS === "android" ? "normal" : "bold",
    fontSize: 20,
  },
  headerTitleAlign: "center",
  headerShown: true,
};
