import "react-native-gesture-handler";
import { createStackNavigator } from "@react-navigation/stack";
import FeedScreen from "screens/FeedScreen";
import LookupUserScreen from "screens/LookupUser";
import ImageScreen from "screens/ImageScreen";
import ProfileStack from "stacks/ProfileStack";
import SettingsStack from "stacks/SettingsStack";
import ConversationScreen from "screens/ConversationScreen";

import React from "react";
import { Platform } from "react-native";

const Stack = createStackNavigator();

export default function MainStack({ navigation, route }) {
  return (
    <Stack.Navigator
      initialRouteName="Feed"
      screenOptions={{
        headerShown: false,
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
        name="Image"
        component={ImageScreen}
        initialParams={route.params}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileStack}
        initialParams={route.params, { fromLookup: false }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsStack}
        initialParams={route.params, { fromLookup: false }}
      />
      <Stack.Screen
        name="Conversations"
        component={ConversationScreen}
        initialParams={route.params}
      />
    </Stack.Navigator>
  );
}
