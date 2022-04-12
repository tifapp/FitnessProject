import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function DrawerButton(props) {
  const navigation = useNavigation();

  const [notificationCount, setNotificationCount] = useState(0);

  // @ts-ignore
  global.showNotificationDot = () => {
    setNotificationCount(notificationCount + 1);
  };

  // @ts-ignore
  global.hideNotificationDot = () => {
    setNotificationCount(0);
  };

  //should separate drawer and search buttons into their own components
  //search button should accept an argument that changes what the default tab is for the friends and groups screens
  return (
    <View style={{ flexDirection: "row" }}>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("Challenge List");
        }}
      >
        <MaterialIcons
          name={"timer"}
          size={30}
          color={"black"}
          style={{ paddingRight: 15 }}
        />
      </TouchableOpacity>

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

      <TouchableOpacity
        onPress={
          // @ts-ignore
          navigation.toggleDrawer
        }
      >
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
