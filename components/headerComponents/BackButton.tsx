import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { TouchableOpacity } from "react-native";

export default function BackButton() {
  const navigation = useNavigation();

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
