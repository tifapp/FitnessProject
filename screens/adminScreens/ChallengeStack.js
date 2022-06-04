// @ts-nocheck
import { createStackNavigator } from "@react-navigation/stack";
import ChallengesScreen from "@screens/adminScreens/AdminChallengesScreen";
import AdminGroupPostsScreen from "@screens/adminScreens/AdminGroupPostsScreen";
import CreateChallengeScreen from "@screens/adminScreens/CreateChallengeScreen";
import React from "react";
import "react-native-gesture-handler";

const Stack = createStackNavigator();

export default function ChallengeStack({ navigation, route }) {
  return (
    <Stack.Navigator initialRouteName="Challenge List">
      <Stack.Screen name="Challenge List" component={ChallengesScreen} />
      <Stack.Screen
        name="Create Challenge"
        component={CreateChallengeScreen} //should be in a separate app, not this one. we'll make a different app to view reports.
      />
      <Stack.Screen name="Challenge" component={AdminGroupPostsScreen} />
    </Stack.Navigator>
  );
}
