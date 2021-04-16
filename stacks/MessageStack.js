import 'react-native-gesture-handler';
import { Button } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import MessageScreen from "screens/MessageScreen";
import LookupScreen from "screens/LookupUser";


import React from 'react';

const Stack = createStackNavigator();

export default function MessageStack({navigation, route}) {
  return (
    <Stack.Navigator screenOptions={{ 
      headerStyle: { backgroundColor: "#efefef" },
      headerTintColor: "#000",
      headerTitleStyle: { fontWeight: Platform.OS === 'android' ? "normal" : "bold", fontSize: 20, },
      headerTitleAlign: "center",  
      headerLeft: () => (
      <Button title="< Back" onPress={() => navigation.goBack()} />
    ), }}>
      <Stack.Screen name='Messages' component={MessageScreen} initialParams={route.params} />
      <Stack.Screen name='Lookup' component={LookupScreen} initialParams={route.params} />
    </Stack.Navigator>
  );
}