import 'react-native-gesture-handler';
import { Button } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from 'screens/ProfileScreen'
import BioScreen from 'screens/BioScreen'
import GoalsScreen from 'screens/GoalsScreen'
import MyGroupsScreen from 'screens/MyGroupsScreen'
import GroupPostsScreen from "screens/GroupPostsScreen";
import CreatingGroups from "screens/CreatingGroups";
import LookupUserScreen from "screens/LookupUser";
import MessageScreen from "screens/MessageScreen";


import React from 'react';

const Stack = createStackNavigator();

export default function ProfileTab({navigation, route}) {
  return (
    <Stack.Navigator initialRouteName='Profile' screenOptions={{ 
      headerStyle: { backgroundColor: "#efefef" },
      headerTintColor: "#000",
      headerTitleStyle: { fontWeight: Platform.OS === 'android' ? "normal" : "bold", fontSize: 20, },
      headerTitleAlign: "center",  
      headerLeft: () => (
      <Button title="< Back" onPress={() => navigation.goBack()} />
    ), }}>
      <Stack.Screen name='Profile' component={ProfileScreen} initialParams={route.params} />
      <Stack.Screen name='Bio' component={BioScreen} />
      <Stack.Screen name='Goals' component={GoalsScreen} />
      <Stack.Screen name='My Groups' component={MyGroupsScreen} initialParams={route.params}/>
      <Stack.Screen name='Create Group' component={CreatingGroups} initialParams={route.params}/>
      <Stack.Screen name='Group Posts Screen' component={GroupPostsScreen} initialParams={route.params}/>
      <Stack.Screen name='Lookup' component={LookupUserScreen} initialParams={route.params} />
      <Stack.Screen name='Messages' component={MessageScreen} initialParams={route.params} />
    </Stack.Navigator>
  );
}