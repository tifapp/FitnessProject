import 'react-native-gesture-handler';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from 'screens/ProfileScreen'
import BioScreen from 'screens/BioScreen'
import GoalsScreen from 'screens/GoalsScreen'

import React from 'react';

// Get the aws resources configuration parameters
import awsconfig from 'root/aws-exports'; // if you are using Amplify CLI
import { Amplify } from "aws-amplify";

Amplify.configure(awsconfig);

const Stack = createStackNavigator();

export default function ProfileTab() {
  return (
    <Stack.Navigator initialRouteName='Profile' screenOptions={{ headerStyle: { backgroundColor: '#d3d3d3' } }}>
      <Stack.Screen name='Profile' component={ProfileScreen}
            options={{
              headerShown: false,
            }} />
      <Stack.Screen name='Bio' component={BioScreen} />
      <Stack.Screen name='Goals' component={GoalsScreen} />
    </Stack.Navigator>
  );
}