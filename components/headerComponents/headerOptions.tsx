import BackButton from "@components/headerComponents/BackButton";
import DrawerButton from "@components/headerComponents/DrawerButton";
import { StackNavigationOptions } from "@react-navigation/stack";
import React from "react";
import { Platform } from "react-native";

export const headerOptions: StackNavigationOptions = {
  headerLeft: () => <BackButton />,
  headerRight: () => <DrawerButton />,
  headerStyle: { backgroundColor: "#a9efe0" },
  headerTintColor: "#000",
  headerTitleStyle: {
    fontWeight: Platform.OS === "android" ? "normal" : "bold",
    fontSize: 20,
  },
  headerTitleAlign: "center",
  headerShown: true,
};
