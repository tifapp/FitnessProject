import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from './screens/ProfileScreen'
import BioScreen from './screens/BioScreen'
import GoalsScreen from './screens/GoalsScreen'

import React from 'react';
import { withAuthenticator } from 'aws-amplify-react-native';

// Get the aws resources configuration parameters
import awsconfig from './aws-exports'; // if you are using Amplify CLI
import { Amplify } from "aws-amplify";

Amplify.configure(awsconfig);

const Stack = createStackNavigator();

export default function ProfileScreen() {	
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName = 'Profile' screenOptions={{ headerStyle: {backgroundColor: '#d3d3d3'} }}>
        <Stack.Screen name = 'Profile' component = {ProfileScreen}/>
		    <Stack.Screen name = 'Bio' component = {BioScreen} />
        <Stack.Screen name = 'Goals' component = {GoalsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}