import React from "react";
import DrawerButton from "components/headerComponents/DrawerButton";
import BackButton from "components/headerComponents/BackButton";

export const headerOptions = {
  headerLeft: (props) => <BackButton {...props} />,
  headerRight: (props) => <DrawerButton {...props} />,
  headerStyle: { backgroundColor: "#efefef" },
  headerTintColor: "#000",
  headerTitleStyle: {
    fontWeight: Platform.OS === "android" ? "normal" : "bold",
    fontSize: 20,
  },
  headerTitleAlign: "center",
  headerShown: true,
};
