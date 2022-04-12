// @ts-nocheck
import { headerOptions } from "@components/headerComponents/headerOptions";
import { createStackNavigator } from "@react-navigation/stack";
import ChallengeListScreen from "@screens/ChallengeListScreen";
import ChallengeScreen from "@screens/ChallengeScreen";
import CreatingGroups from "@screens/CreatingGroups";
import FeedScreen from "@screens/FeedScreen";
import GroupPostsScreen from "@screens/GroupPostsScreen";
import ImageScreen from "@screens/ImageScreen";
import LookupUserScreen from "@screens/LookupUser";
import SearchScreen from "@screens/SearchScreen";
import React from "react";
import "react-native-gesture-handler";

const Stack = createStackNavigator();

export default function MainStack({ navigation, route }) {
  return (
    <Stack.Navigator initialRouteName="Feed" screenOptions={headerOptions}>
      <Stack.Screen name="Feed" initialParams={route.params}>
        {(props) => <FeedScreen {...props} channel={"general"} />}
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
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen
        name="Create Group"
        component={CreatingGroups}
        initialParams={route.params}
      />
      <Stack.Screen
        name="Group Posts Screen"
        component={GroupPostsScreen}
        initialParams={route.params}
      />
      <Stack.Screen
        name="Challenge"
        component={ChallengeScreen}
        initialParams={route.params}
      />
      <Stack.Screen
        name="Challenge List"
        component={ChallengeListScreen}
        initialParams={route.params}
      />
    </Stack.Navigator>
  );
}
