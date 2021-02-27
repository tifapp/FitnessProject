import "react-native-gesture-handler";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FeedStack from "stacks/FeedStack";
import SearchStack from "stacks/SearchStack";

import React from "react";

const Tab = createBottomTabNavigator();

export default function MainTabs({ navigation, route }) {
  return (
    <Tab.Navigator
      tabBarOptions={{
        activeTintColor: "orange",
        labelStyle: {
          fontSize: 20,
          fontWeight: "bold",
          margin: 0,
          padding: 0,
        },
        tabStyle: {
          height: 47,
        },
      }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedStack}
        initialParams={{ id: route.params?.id }}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStack}
        initialParams={{ id: route.params?.id }}
        options={{
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}
