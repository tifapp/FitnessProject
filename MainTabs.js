import "react-native-gesture-handler";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MainStack from "stacks/MainStack";
import SearchStack from "stacks/SearchStack";

import React from "react";

const Tab = createBottomTabNavigator();

export default function MainTabs({ navigation, route, friendIds }) {
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
        component={MainStack}
        initialParams={{ myId: route.params?.myId }}
        options={{
          headerShown: false,
        }}
        friendIds={friendIds}
      />
      <Tab.Screen
        name="Search"
        component={SearchStack}
        initialParams={{ myId: route.params?.myId }}
        options={{
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}
