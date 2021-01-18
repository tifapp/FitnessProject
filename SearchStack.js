import 'react-native-gesture-handler';
import { createStackNavigator } from '@react-navigation/stack';
import SearchScreen from "screens/SearchScreen";
import CreatingGroups from "screens/CreatingGroups";
import GroupPostsScreen from "screens/GroupPostsScreen";
import LookupUserScreen from "screens/LookupUser";

import React from 'react';

const Stack = createStackNavigator();

export default function GroupSearchStack({route}) {
  const {id} = route.params
  
  return (
    <Stack.Navigator initialRouteName='Search' screenOptions={{ headerStyle: { backgroundColor: '#d3d3d3' } }}>
      <Stack.Screen name='Search' component={SearchScreen} />
      <Stack.Screen name='Lookup' component={LookupUserScreen} initialParams={route.params} />
      <Stack.Screen name='Create Group' component={CreatingGroups} initialParams={route.params}/>
      <Stack.Screen name='Group Posts Screen' component={GroupPostsScreen} initialParams={route.params}/>
    </Stack.Navigator>
  );
}