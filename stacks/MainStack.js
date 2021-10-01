import "react-native-gesture-handler";
import { createStackNavigator } from "@react-navigation/stack";
import FeedScreen from "screens/FeedScreen";
import LookupUserScreen from "screens/LookupUser";
import ImageScreen from "screens/ImageScreen";
import SearchScreen from "screens/SearchScreen";
import CreatingGroups from "screens/CreatingGroups";
import GroupPostsScreen from "screens/GroupPostsScreen";
import { headerOptions } from "components/headerComponents/headerOptions"

import React from "react";
import { Platform } from "react-native";

const Stack = createStackNavigator();

export default function MainStack({ navigation, route }) {
  return (
    <Stack.Navigator
      initialRouteName="Feed"
      screenOptions={headerOptions}
    >
      <Stack.Screen
      name="Feed"
      initialParams={route.params}>
        {(props) => <FeedScreen
          {...props}
          channel={"general"}
        />}
      </Stack.Screen>
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
      <Stack.Screen name='Search' component={SearchScreen} />
      <Stack.Screen name='Create Group' component={CreatingGroups} initialParams={route.params}/>
      <Stack.Screen name='Group Posts Screen' component={GroupPostsScreen} initialParams={route.params}/>
    </Stack.Navigator>
  );
}
