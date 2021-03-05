import "react-native-gesture-handler";
import { createStackNavigator } from "@react-navigation/stack";
import FeedScreen from "screens/FeedScreen";
import LookupUserScreen from "screens/LookupUser";
import MessageScreen from "screens/MessageScreen";
import ImageScreen from "screens/ImageScreen";
import DrawerButton from "components/headerComponents/DrawerButton";

import React from "react";

const Stack = createStackNavigator();

export default function FeedStack({ navigation, route }) {
  return (
    <Stack.Navigator
      initialRouteName="Feed"
      screenOptions={{
        headerLeft: () => (
          <DrawerButton navigationProps={navigation} />
        ),
        headerStyle: { backgroundColor: "orange" },
        headerTintColor: "#000",
        headerTitleStyle: { fontWeight: "normal", fontSize: 20, },
        headerTitleAlign: "center"
      }}
    >
      <Stack.Screen
        name="Feed"
        component={FeedScreen}
        initialParams={route.params}
      />
      <Stack.Screen
        name="Lookup"
        component={LookupUserScreen}
        initialParams={route.params}
      />
      <Stack.Screen
        name="Messages"
        component={MessageScreen}
        initialParams={route.params}
      />
      <Stack.Screen
        name="Image"
        component={ImageScreen}
        initialParams={route.params}
      />
    </Stack.Navigator>
  );
}
