import 'react-native-gesture-handler';
import { Button } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from 'screens/ProfileScreen'
import BioScreen from 'screens/BioScreen'
import GoalsScreen from 'screens/GoalsScreen'
import LookupUserScreen from "screens/LookupUser";
import MessageScreen from "screens/MessageScreen";


import React from 'react';
import { headerOptions } from '../components/headerComponents/headerOptions';

const Stack = createStackNavigator();

export default function ProfileTab({navigation, route}) {
  return (
    <Stack.Navigator initialRouteName='Profile' 
    screenOptions={headerOptions} >
      <Stack.Screen name='Profile' component={ProfileScreen} initialParams={route.params} />
      <Stack.Screen name='Bio' component={BioScreen} />
      <Stack.Screen name='Goals' component={GoalsScreen} />
      <Stack.Screen name='Lookup' component={LookupUserScreen} initialParams={route.params} />
      <Stack.Screen name='Messages' component={MessageScreen} initialParams={route.params} />
    </Stack.Navigator>
  );
}