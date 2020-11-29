import 'react-native-gesture-handler';
import { createStackNavigator } from '@react-navigation/stack';
import FriendScreen from "screens/FriendScreen";

import React from 'react';

// Get the aws resources configuration parameters
import awsconfig from 'root/aws-exports'; // if you are using Amplify CLI
import { Amplify } from "aws-amplify";

Amplify.configure(awsconfig);

const Stack = createStackNavigator();

export default function FriendStack({route}) {
  const {id} = route.params
  
  return (
    <Stack.Navigator initialRouteName='Friends' screenOptions={{ headerStyle: { backgroundColor: '#d3d3d3' } }}>
      <Stack.Screen name='Friends' component={FriendScreen} initialParams={route.params}/>
    </Stack.Navigator>
  );
}