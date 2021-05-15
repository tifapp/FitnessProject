import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useRef } from "react";
import {
  AppState,
  ActivityIndicator,
  LogBox,
  UIManager,
  Text,
  useWindowDimensions
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { withAuthenticator } from "aws-amplify-react-native";
// Get the aws resources configuration parameters
import awsconfig from "./src/aws-exports"; // if you are using Amplify CLI
import { Amplify, API, graphqlOperation, Auth, Cache, Storage } from "aws-amplify";
import { getUser } from "./src/graphql/queries";
import ProfileStack from "stacks/ProfileStack";
import MainTabs from "./MainTabs";
import SettingsScreen from "screens/SettingsScreen";
import ConversationScreen from "screens/ConversationScreen";
import ComplianceScreen from "screens/ComplianceScreen";
import ProfileScreen from "screens/ProfileScreen";
import BioScreen from "screens/BioScreen";
import GoalsScreen from "screens/GoalsScreen";
import { updateUser } from 'root/src/graphql/mutations.js'
import SignIn from "root/components/loginComponents/SignIn.tsx";
import SignUp from "root/components/loginComponents/SignUp.tsx";
import RequireNewPassword from "root/components/loginComponents/RequireNewPassword.tsx";
import ConfirmSignIn from "root/components/loginComponents/ConfirmSignIn.tsx";
import ConfirmSignUp from "root/components/loginComponents/ConfirmSignUp.tsx";
import ForgotPassword from "root/components/loginComponents/ForgotPassword.tsx";
import VerifyContact from "root/components/loginComponents/VerifyContact.tsx";
import Greetings from "root/components/loginComponents/Greetings.tsx";
import CustomSidebarMenu from 'root/screens/CustomSidebarMenu';

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from '@react-navigation/drawer';

import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { StatusBar } from "expo-status-bar";
import MessageScreen from "./screens/MessageScreen";
import LookupUserScreen from "screens/LookupUser";
import {headerOptions} from "components/headerComponents/headerOptions"

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

Amplify.configure({
  awsconfig,
  Analytics: {
    disabled: true,
  },
}); //for some reason this removes the unhandled promise rejection error on startup
Auth.configure(awsconfig);
API.configure(awsconfig);
Storage.configure(awsconfig);

const config = {
  storage: AsyncStorage,
  capacityInBytes: 5000000,
};

Cache.configure(config);
//Cache.clear(); //will we have to do this for the next build?

var styles = require("./styles/stylesheet");

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const App = () => {
  //Text.defaultProps = Text.defaultProps || {}
  //Text.defaultProps.style =  { fontFamily: 'Helvetica', fontSize: 15, fontWeight: 'normal' }
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  const [userId, setUserId] = useState('checking...'); //stores the user's id if logged in

  const [friendIds, setFriendIds] = useState([]);

  const checkIfUserSignedUp = async () => {
    try {
      const query = await Auth.currentUserInfo();
      const user = await API.graphql(
        graphqlOperation(getUser, { id: query.attributes.sub })
      );
      if (user.data.getUser != null) {
        setUserId(query.attributes.sub);
        global.id = query.attributes.sub;
      } else {
        setUserId('');
      }

      console.log("success, user is ", user);
    } catch (err) {
      console.log("error: ", err);
    }
  };

  const requestAndSaveNotificationPermissions = async () => {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // Only update the profile with the expoToken if it not exists yet
    if (token !== "") {
      const inputParams = {
        deviceToken: token
      };
      await API.graphql(graphqlOperation(updateUser, { input: inputParams }));
    }
  }

  useEffect(() => {
    AppState.addEventListener("change", _handleAppStateChange);
    checkIfUserSignedUp();

    return () => {
      AppState.removeEventListener("change", _handleAppStateChange);
    };
  }, []);

  const _handleAppStateChange = (nextAppState) => {
    if (
      nextAppState.match(/inactive|background/) &&
      appState.current === "active"
    ) {      
      Cache.setItem("lastOnline", Date.now(), { priority: 1 });
    }

    appState.current = nextAppState;
    setAppStateVisible(appState.current);
  };

  const setUniqueFriendIds = (items) => {
    if (JSON.stringify(friendIds.sort()) !== JSON.stringify(items.sort())) //will work when objects are shuffled, but all items will probably refresh still if there's one extra item added to the list
      setFriendIds(items);
  }

  useEffect(() => {
    if (userId !== 'checking...' && userId !== '') {
      requestAndSaveNotificationPermissions();
    }
  }, [userId])

  //console.log("App rerendered, userexists is... ", userId == '');
  const dimensions = useWindowDimensions();

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
            initialParams={{ newUser: true, myId: userId, setUserIdFunction: setUserId }}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen name="Bio" component={BioScreen} />
          <Stack.Screen name="Goals" component={GoalsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  } else {
    return (
      <NavigationContainer>
        <StatusBar style="dark" />
        <Drawer.Navigator
          drawerPosition={"right"}
          drawerStyle={{width: dimensions.width}}
          drawerContentOptions={{
            activeTintColor: "#e91e63",
            itemStyle: { marginVertical: 5 },
          }}
          backBehavior="initialRoute"
          edgeWidth={100}
          initialRouteName="MainTabs"
          drawerContent={(props) => (
            <CustomSidebarMenu
              myId={userId}
              setFriendIds={setUniqueFriendIds}
              {...props}
            />
          )}
          screenOptions={headerOptions}
        >
          <Drawer.Screen
            name="Feed"
            component={MainTabs}
            initialParams={{ myId: userId, fromLookup: false }}
            options={{headerShown: false}}
          />
          <Drawer.Screen
            name="Profile"
            component={ProfileStack}
            initialParams={{ myId: userId }}
            options={{headerShown: false}}
          />
          <Drawer.Screen
            name="Conversations"
            component={ConversationScreen}
            initialParams={{ myId: userId }}
          />
          <Drawer.Screen
            name="Settings"
            component={SettingsScreen}
            initialParams={{ myId: userId }}
          />
          {friendIds.map((friendId) => (
            <Drawer.Screen
              key={friendId}
              name={friendId}
              component={MessageScreen}
              initialParams={{ myId: userId, userId: friendId }}
            />
          ))}
        </Drawer.Navigator>
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

export default withAuthenticator(App, false, [ //this is why we cant have splash screen
  <Greetings/>,
  <SignIn/>,
  <SignUp/>,
  <ConfirmSignIn/>,
  <ConfirmSignUp/>,
  <VerifyContact/>,
  <ForgotPassword/>,
  <RequireNewPassword/>,
]);