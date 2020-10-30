import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  Button,
  Image,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  LogBox
} from "react-native";
import { withAuthenticator } from "aws-amplify-react-native";
// Get the aws resources configuration parameters
import awsconfig from "./aws-exports"; // if you are using Amplify CLI
import { Amplify, API, graphqlOperation, Auth } from "aws-amplify";
import { getUser } from "./src/graphql/queries";
import GroupStack from "./GroupStack";
import ProfileTab from "./ProfileTab";
import ComplianceScreen from "./screens/ComplianceScreen";
import ProfileScreen from "./screens/ProfileScreen";
import BioScreen from "./screens/BioScreen";
import GoalsScreen from "./screens/GoalsScreen";
import CreatingGroups from "./screens/CreatingGroups";
import SearchStack from "./SearchStack";
import GroupSearchStack from "./GroupCreationStack";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
  ]);

Amplify.configure({
  awsconfig,
  Analytics: {
    disabled: true,
  },
}); //for some reason this removes the unhandled promise rejection error on startup

var styles = require("./styles/stylesheet");

const App = () => {
  const Tab = createBottomTabNavigator();
  const [userId, setUserId] = useState(''); //stores the user's id if logged in

  const checkIfUserExists = async () => {
    try {
      setUserId('checking...');
      const query = await Auth.currentUserInfo();
      const user = await API.graphql(
        graphqlOperation(getUser, { id: query.attributes.sub })
      );
      if (user.data.getUser != null) {
        setUserId(query.attributes.sub);
      } else {
        setUserId('');
      }

      console.log("success, user is ", user);
    } catch (err) {
      console.log("error: ", err);
    }
  };

  useEffect(() => {
    checkIfUserExists();
  }, []);

  //console.log("App rerendered, userexists is... ", userId == '');

  const Stack = createStackNavigator();

  if (userId == 'checking...') {
    return (
      <ActivityIndicator 
      size="large" 
      color="#0000ff"
      style={{
        flex: 1,
        justifyContent: "center",
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10,
      }} />
    )
  } else if (userId == '') {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Compliance Forms"
            component={ComplianceScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            initialParams={{ newUser: true, id: userId, setUserIdFunction: setUserId }}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen name="Bio" component={BioScreen} />
          <Stack.Screen name="Goals" component={GoalsScreen} />
          <Stack.Screen name="Group" component={CreatingGroups} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  } else {
    return (
      <NavigationContainer>
        <Tab.Navigator
          tabBarOptions={{
            activeTintColor: "orange",
            labelStyle: {
              fontSize: 20,
              fontWeight: "bold",
              margin: 0,
              padding: 0,
            },
            tabStyle: {
              height: 47,
            },
          }}
        >
          <Tab.Screen
            name="Groups"
            component={GroupStack}
            initialParams={{id: userId}}
            options={{
              headerShown: false,
            }}
          />
          <Tab.Screen 
            name="Search"
            component={GroupSearchStack}
            initialParams={{id: userId}}
            options={{
              headerShown: false,
            }}
          />
          <Tab.Screen 
            name="Profile"
            component={ProfileTab}
            options={{
              headerShown: false,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
};

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon({ name, color }) {
  return (
    <Ionicons size={50} style={{ marginBottom: 0 }} {...{ name, color }} />
  );
}

export default withAuthenticator(App);
