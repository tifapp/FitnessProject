import 'react-native-gesture-handler';
import { createStackNavigator } from '@react-navigation/stack';
import GroupScreen from "screens/GroupScreen";
import LookupUserScreen from "screens/LookupUser";

import React from 'react';

// Get the aws resources configuration parameters
import awsconfig from 'root/aws-exports'; // if you are using Amplify CLI
import { Amplify } from "aws-amplify";

Amplify.configure(awsconfig);

const Stack = createStackNavigator();

export default function SearchStack({ navigation, route }) {
  return (
    <Stack.Navigator initialRouteName='Wall' screenOptions={{ headerStyle: { backgroundColor: '#d3d3d3' } }}>
      <Stack.Screen name='Wall' component={GroupScreen} initialParams={route.params}/>
      <Stack.Screen name='Lookup' component={LookupUserScreen} />
    </Stack.Navigator>
  );
}