import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, Button, Image, View, TextInput } from 'react-native';
import { withAuthenticator } from 'aws-amplify-react-native';
// Get the aws resources configuration parameters
import awsconfig from './aws-exports'; // if you are using Amplify CLI
import { Amplify, API, graphqlOperation } from "aws-amplify";
import { createUser, updateUser, deleteUser } from './src/graphql/mutations';
import { listUsers } from './src/graphql/queries';
import GroupScreen from './GroupScreen';
import ProfileTab from './ProfileTab';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

Amplify.configure(
  {awsconfig, Analytics: {
    disabled: true,
  },}); //for some reason this removes the unhandled promise rejection error on startup

function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home!</Text>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Settings!</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

const App = () => {	
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Groups" component={GroupScreen} />
        <Tab.Screen name="Profile" component={ProfileTab} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
//<Tab.Screen name="Users" component={UsersScreen} />
//<Tab.Screen name="Profile" component={ProfileScreen} />
export default withAuthenticator(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
