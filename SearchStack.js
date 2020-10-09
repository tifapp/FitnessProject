import 'react-native-gesture-handler';
import { createStackNavigator } from '@react-navigation/stack';
import SearchScreen from "./SearchScreen";
import LookupUserScreen from "./screens/LookupUser";

import React from 'react';

// Get the aws resources configuration parameters
import awsconfig from './aws-exports'; // if you are using Amplify CLI
import { Amplify } from "aws-amplify";

Amplify.configure(awsconfig);

const Stack = createStackNavigator();

export default function SearchStack() {
  return (
    <Stack.Navigator initialRouteName='Search' screenOptions={{ headerStyle: { backgroundColor: '#d3d3d3' } }}>
      <Stack.Screen name='Search' component={SearchScreen} />
      <Stack.Screen name='Lookup' component={LookupUserScreen} />
    </Stack.Navigator>
  );
}