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

export enum MainScreenNames {
  FEED = "Feed",
  LOOKUP = "Lookup",
  IMAGE = "Image",
  SEARCH = "Search",
  CREATE_GROUP = "Create Group",
  GROUP_FEED = "Group Feed",
  CHALLENGE = "Challenge",
  CHALLENGE_MENU = "Challenge Menu",
}

export type MainStackParamList = {
  [MainScreenNames.CHALLENGE_MENU] : { userId: string };
};

export default function MainStack() {
  return (
    <Stack.Navigator initialRouteName={MainScreenNames.FEED} screenOptions={headerOptions}>
      <Stack.Screen name={MainScreenNames.FEED}>
        {(props) => (
          <FeedScreen
            {...props}
            channel={"general"}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name={MainScreenNames.LOOKUP}
        component={LookupUserScreen}
      />
      <Stack.Screen
        name={MainScreenNames.IMAGE}
        component={ImageScreen}
      />
      <Stack.Screen name={MainScreenNames.SEARCH} component={SearchScreen} />
      <Stack.Screen
        name={MainScreenNames.CREATE_GROUP}
        component={CreatingGroups}
      />
      <Stack.Screen
        name={MainScreenNames.GROUP_FEED}
        component={GroupPostsScreen}
      />
      <Stack.Screen
        name={MainScreenNames.CHALLENGE}
        component={ChallengeScreen}
      />
      <Stack.Screen
        name={MainScreenNames.CHALLENGE_MENU}
        component={ChallengeListScreen}
      />
    </Stack.Navigator>
  );
}
