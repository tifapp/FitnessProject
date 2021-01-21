import 'react-native-gesture-handler';
import { createStackNavigator } from '@react-navigation/stack';
import FeedScreen from "screens/FeedScreen";
import LookupUserScreen from "screens/LookupUser";
import MessageScreen from "screens/MessageScreen";

import React from 'react';

const Stack = createStackNavigator();

export default function FeedStack({ navigation, route }) {
  return (
    <Stack.Navigator initialRouteName='Feed' screenOptions={{ headerStyle: { backgroundColor: '#d3d3d3' } }}>
      <Stack.Screen name='Feed' component={FeedScreen} initialParams={route.params}/>
      <Stack.Screen name='Lookup' component={LookupUserScreen} initialParams={route.params} />
      <Stack.Screen name='Messages' component={MessageScreen} initialParams={route.params} />
    </Stack.Navigator>
  );
}