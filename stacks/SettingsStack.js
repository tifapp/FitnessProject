import 'react-native-gesture-handler';
import { Button } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from "screens/SettingsScreen";
import LookupUserScreen from "screens/LookupUser";

import React from 'react';

const Stack = createStackNavigator();

export default function GroupSearchStack({navigation, route}) {
  const {id} = route.params
  
  return (
    <Stack.Navigator screenOptions={{ 
      headerStyle: { backgroundColor: "#efefef" },
      headerTintColor: "#000",
      headerTitleStyle: { fontWeight: Platform.OS === 'android' ? "normal" : "bold", fontSize: 20, },
      headerTitleAlign: "center",  
      headerLeft: () => (
      <Button title="< Back" onPress={() => navigation.goBack()} />
    ), }}>
      <Stack.Screen name='Block List' component={SettingsScreen} initialParams={route.params} />
      <Stack.Screen
        name="Lookup"
        component={LookupUserScreen}
        initialParams={route.params}
      />
    </Stack.Navigator>
  );
}