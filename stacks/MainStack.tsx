import { headerOptions } from "@components/headerComponents/headerOptions";
import {
  createStackNavigator,
  StackScreenProps,
} from "@react-navigation/stack";
import ChallengeListScreen from "@screens/ChallengeListScreen";
import ChallengeScreen from "@screens/ChallengeScreen";
import CreatingGroups from "@screens/CreatingGroups";
import FeedScreen from "@screens/FeedScreen";
import GroupPostsScreen from "@screens/GroupPostsScreen";
import HomeScreen from "@screens/HomeScreen";
import ImageScreen from "@screens/ImageScreen";
import LookupUserScreen from "@screens/LookupUser";
import SearchScreen from "@screens/SearchScreen";
import React from "react";
import "react-native-gesture-handler";
import { Group } from "src/models";

const Stack = createStackNavigator();

export enum MainScreenNames {
  HOME = "Home",
  LOOKUP = "Lookup",
  IMAGE = "Image",
  SEARCH = "Search",
  CREATE_GROUP = "Create Group",
  GROUP_FEED = "Group Feed",
  CHALLENGE_FEED = "Challenge",
  CHALLENGE_MENU = "Challenge Menu",
}

export type MainStackParamList = {
  [MainScreenNames.HOME]: { channel: string };
  [MainScreenNames.LOOKUP]: { userId: string };
  [MainScreenNames.IMAGE]: { uri: string };
  [MainScreenNames.CREATE_GROUP]: { checkFields?: boolean; group: Group };
  [MainScreenNames.GROUP_FEED]: { group: Group };
  [MainScreenNames.CHALLENGE_FEED]: {
    channel: string;
    open: boolean;
    winner: string;
  };
};

export type FeedScreenRouteProps = StackScreenProps<
  MainStackParamList,
  MainScreenNames.HOME
>["route"];
export type LookupScreenRouteProps = StackScreenProps<
  MainStackParamList,
  MainScreenNames.LOOKUP
>["route"];
export type ImageScreenRouteProps = StackScreenProps<
  MainStackParamList,
  MainScreenNames.IMAGE
>["route"];
export type CreateGroupScreenRouteProps = StackScreenProps<
  MainStackParamList,
  MainScreenNames.CREATE_GROUP
>["route"];
export type GroupFeedScreenRouteProps = StackScreenProps<
  MainStackParamList,
  MainScreenNames.GROUP_FEED
>["route"];
export type ChallengeFeedScreenRouteProps = StackScreenProps<
  MainStackParamList,
  MainScreenNames.CHALLENGE_FEED
>["route"];

export default function MainStack() {
  return (
    <Stack.Navigator
      initialRouteName={MainScreenNames.HOME}
      screenOptions={headerOptions}
    >
      <Stack.Screen name={MainScreenNames.HOME}>
        {(props) => (
          <HomeScreen
            feedView={<FeedScreen {...props} channel={"general"} />}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name={MainScreenNames.LOOKUP}
        component={LookupUserScreen}
      />
      <Stack.Screen name={MainScreenNames.IMAGE} component={ImageScreen} />
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
        name={MainScreenNames.CHALLENGE_FEED}
        component={ChallengeScreen}
      />
      <Stack.Screen
        name={MainScreenNames.CHALLENGE_MENU}
        component={ChallengeListScreen}
      />
    </Stack.Navigator>
  );
}
