import 'react-native-gesture-handler';
import { Button } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import BlockListScreen from "screens/BlockListScreen";
import LookupUserScreen from "screens/LookupUser";
import PrivacyScreen from "screens/PrivacyScreen";

import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  LayoutAnimation
} from "react-native";
import { Auth, API, graphqlOperation, Cache, Storage } from "aws-amplify";
import { createUser, updateUser, deleteUser } from '../src/graphql/mutations'

function Settings({navigation, route}) {
  const deleteUserAsync = async () => {
    console.log("my id is", route.params?.myId)

    await API.graphql(graphqlOperation(deleteUser, { input: { id: route.params?.myId } }));

    await Storage.remove('profileimage.jpg', { level: 'protected' })
        .then(result => console.log("removed profile image!", result))
        .catch(err => console.log(err));

    return 'successfully deleted';
  };

  function deleteAccount() {
      const title = 'Are you sure you want to delete your account?';
      const message = '';
      const options = [
          {
              text: 'Yes', onPress: () => {
                  Alert.alert('Are you REALLY sure you want to delete your account?', '', [
                      {
                          text: 'Yes', onPress: () => {
                              deleteUserAsync().then(() => { Auth.signOut() }).catch()
                          }
                      }, //if submithandler fails user won't know
                      { text: 'Cancel', type: 'cancel', },
                  ], { cancelable: true });
              }
          }, //if submithandler fails user won't know
          { text: 'Cancel', type: 'cancel', },
      ];
      Alert.alert(title, message, options, { cancelable: true });
  }

  return (
    <View>
    <PrivacyScreen
    route={route}
    />
    <TouchableOpacity onPress = {() => {navigation.navigate("Block List")}}>
    <Text
      style={{
        fontSize: 18,
        margin: 20,
      }}
    >
      Block List
    </Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => { Auth.signOut() } //should be an "account actions" screen
    }>
      <Text
      style={{
        fontSize: 15,
        margin: 20,
      }}>
        Log Out
      </Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={deleteAccount}>
      <Text
      style={{
        fontSize: 15,
        margin: 20,
      }}>
        Delete User
      </Text>
    </TouchableOpacity>
    </View>
  )
}

const Stack = createStackNavigator();

export default function SettingsStack({navigation, route}) {  
  return (
    <Stack.Navigator screenOptions={{ 
      headerShown: false}}>
      <Stack.Screen name='Settings' component={Settings} initialParams={route.params} />
      <Stack.Screen options={{headerShown: true}} name='Block List' component={BlockListScreen} initialParams={route.params} />
      <Stack.Screen
        name="Lookup"
        component={LookupUserScreen}
        initialParams={route.params}
      />
    </Stack.Navigator>
  );
}