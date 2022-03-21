import { MaterialIcons } from "@expo/vector-icons";
import { useIsDrawerOpen } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { TouchableOpacity } from "react-native";

export default function DrawerButton(props) {
  const navigation = useNavigation();
  const isDrawerOpen = useIsDrawerOpen();

  return (
    <TouchableOpacity
      onPress={navigation.goBack}
      style={{ flexDirection: "row", alignItems: "center" }}
    >
      <MaterialIcons
        name="arrow-back"
        size={30}
        color={"black"}
        style={{ paddingLeft: 10 }}
      />
    </TouchableOpacity>
  );
}
