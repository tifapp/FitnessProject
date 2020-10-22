import 'react-native-gesture-handler';
import { createStackNavigator } from '@react-navigation/stack';
import GroupSearchScreen from "./GroupSearchScreen";
import CreatingGroups from "screens/CreatingGroups";
import GroupPostsScreen from "./screens/GroupPostsScreen";

import React from 'react';

// Get the aws resources configuration parameters
import awsconfig from 'root/aws-exports'; // if you are using Amplify CLI
import { Amplify } from "aws-amplify";

Amplify.configure(awsconfig);

const Stack = createStackNavigator();

export default function GroupSearchStack({route}) {
  return (
    <Stack.Navigator initialRouteName='GroupSearch' screenOptions={{ headerStyle: { backgroundColor: '#d3d3d3' } }}>
      <Stack.Screen name='GroupSearch' component={GroupSearchScreen}/>
      <Stack.Screen name='Create Group' component={CreatingGroups} />
      <Stack.Screen name='Group Posts Screen' component={GroupPostsScreen}/>
    </Stack.Navigator>
  );
}