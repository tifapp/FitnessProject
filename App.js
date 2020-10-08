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
  Linking,
  ActivityIndicator,
} from "react-native";
import { withAuthenticator } from "aws-amplify-react-native";
// Get the aws resources configuration parameters
import awsconfig from "./aws-exports"; // if you are using Amplify CLI
import { Amplify, API, graphqlOperation, Auth } from "aws-amplify";
import { getUser } from "./src/graphql/queries";
import GroupScreen from "./GroupScreen";
import ProfileTab from "./ProfileTab";
import ProfileScreen from "./screens/ProfileScreen";
import BioScreen from "./screens/BioScreen";
import GoalsScreen from "./screens/GoalsScreen";
import CreatingGroups from "./screens/CreatingGroups";
import SearchStack from "./SearchStack";
import VideoTest from "./VideoTest";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

Amplify.configure({
  awsconfig,
  Analytics: {
    disabled: true,
  },
}); //for some reason this removes the unhandled promise rejection error on startup

var styles = require("./styles/stylesheet");

function ComplianceScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text
        style={{
          textAlign: "center",
          padding: 40,
          fontWeight: "bold",
          lineHeight: 20,
        }}
      >
        By continuing, you agree to our {"\n"}
        <Text
          style={{ color: "orange" }}
          onPress={() =>
            Linking.openURL(
              "https://drive.google.com/file/d/15OG-z9vZ97eNWHKooDrBEtV51Yz2fMRQ/view?usp=sharing"
            )
          }
        >
          Terms of Service,{" "}
        </Text>
        <Text
          style={{ color: "orange" }}
          onPress={() =>
            Linking.openURL(
              "https://drive.google.com/file/d/11wIw9yQcT_mHHDT_xflVxEzzEUfh3KgN/view?usp=sharing"
            )
          }
        >
          Privacy Policy, {"\n"}
        </Text>
        <Text
          style={{ color: "orange" }}
          onPress={() =>
            Linking.openURL(
              "https://drive.google.com/file/d/13VlxdknD3xSVdqMFHpV3ADXfmEql_NP6/view?usp=sharing"
            )
          }
        >
          Community Standards,{" "}
        </Text>
        <Text
          style={{ color: "orange" }}
          onPress={() =>
            Linking.openURL(
              "https://drive.google.com/file/d/1aZ0oiThB4vBztSdmemN8p97L3gxcS302/view?usp=sharing"
            )
          }
        >
          and Disclaimers.
        </Text>
      </Text>
      <TouchableOpacity
        style={styles.buttonStyle}
        onPress={() => navigation.navigate("Profile")}
      >
        <Text style={styles.buttonTextStyle}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const App = () => {
  const Tab = createBottomTabNavigator();
  const [checkingIfLoggedIn, setCheckingIfLoggedIn] = useState(false);
  const [userNull, setUser] = useState(true);

  const checkIfUserExists = async () => {
    try {
      const query = await Auth.currentUserInfo();
      const user = await API.graphql(
        graphqlOperation(getUser, { id: query.attributes.sub })
      );
      setUser(user.data.getUser == null);
      setCheckingIfLoggedIn(false);

      console.log("success, user is ", user);
    } catch (err) {
      console.log("error: ", err);
    }
  };

  useEffect(() => {
    setCheckingIfLoggedIn(true);
    checkIfUserExists();
  }, []);

  console.log("App rerendered, userexists is... ", userNull);

  const Stack = createStackNavigator();

  if (checkingIfLoggedIn) {
    return (
      <ActivityIndicator size="large" style={{
        flex: 1,
        justifyContent: "center",
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10
      }} />
    )
  } else if (userNull) {
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
            initialParams={{ newUser: true, setUserNullFunction: setUser }}
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
            component={GroupScreen}
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
          <Tab.Screen
            name="Create Group"
            component={CreatingGroups}
            options={{
              headerShown: false,
            }}
          />
          <Tab.Screen
            name="User Search"
            component={SearchStack}
            options={{
              headerShown: false,
            }}
          />
          <Tab.Screen
            name="Video test"
            component={VideoTest}
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
