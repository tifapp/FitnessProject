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

export default function MainStack() {
  return (
    <Stack.Navigator initialRouteName="Feed" screenOptions={headerOptions}>
      <Stack.Screen name="Feed">
        {(props) => (
          <FeedScreen
            {...props}
            channel={"general"}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="Lookup"
        component={LookupUserScreen}
      />
      <Stack.Screen
        name="Image"
        component={ImageScreen}
      />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen
        name="Create Group"
        component={CreatingGroups}
      />
      <Stack.Screen
        name="Group Posts Screen"
        component={GroupPostsScreen}
      />
      <Stack.Screen
        name="Challenge"
        component={ChallengeScreen}
      />
      <Stack.Screen
        name="Challenge List"
        component={ChallengeListScreen}
      />
    </Stack.Navigator>
  );
}
