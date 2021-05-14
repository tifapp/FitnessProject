import "react-native-gesture-handler";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MainStack from "stacks/MainStack";
import SearchStack from "stacks/SearchStack";

import React, { useEffect } from "react";

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
        initialParams={route.params}
        component={MainStack}
      />
      <Tab.Screen
        name="Search"
        component={SearchStack}
        initialParams={route.params}
      />
    </Tab.Navigator>
  );
}
