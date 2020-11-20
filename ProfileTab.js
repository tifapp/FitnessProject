import 'react-native-gesture-handler';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from 'screens/ProfileScreen'
import BioScreen from 'screens/BioScreen'
import GoalsScreen from 'screens/GoalsScreen'
import MyGroupsScreen from 'screens/MyGroupsScreen'
import GroupPostsScreen from "screens/GroupPostsScreen";
import CreatingGroups from "screens/CreatingGroups";

import React from 'react';

// Get the aws resources configuration parameters
import awsconfig from 'root/aws-exports'; // if you are using Amplify CLI
import { Amplify } from "aws-amplify";

Amplify.configure(awsconfig);

const Stack = createStackNavigator();

export default function ProfileTab({route}) {
  return (
    <Stack.Navigator initialRouteName='Profile' screenOptions={{ headerStyle: { backgroundColor: '#d3d3d3' } }}>
      <Stack.Screen name='Profile' component={ProfileScreen} initialParams={route.params}
            options={{
              headerShown: false,
            }} />
      <Stack.Screen name='Bio' component={BioScreen} />
      <Stack.Screen name='Goals' component={GoalsScreen} />
      <Stack.Screen name='My Groups' component={MyGroupsScreen} initialParams={route.params}/>
      <Stack.Screen name='Create Group' component={CreatingGroups} initialParams={route.params}/>
      <Stack.Screen name='Group Posts Screen' component={GroupPostsScreen} initialParams={route.params}/>
    </Stack.Navigator>
  );
}