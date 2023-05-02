import BackButton from "@components/headerComponents/BackButton"
import { StackNavigationOptions } from "@react-navigation/stack"
import React from "react"

export const headerOptions: StackNavigationOptions = {
  headerLeft: () => <BackButton />,
  headerShown: false
  // headerRight: () => <DrawerButton />,
  /* headerStyle: { backgroundColor: "#a9efe0" },
  headerTintColor: "#000",
  headerTitleStyle: {
    fontWeight: Platform.OS === "android" ? "normal" : "bold",
    fontSize: 20
  },
  headerTitleAlign: "center",

  detachPreviousScreen: true */
}
