// @ts-nocheck
import { headerOptions } from "@components/headerComponents/headerOptions";
import ConfirmSignIn from "@components/loginComponents/ConfirmSignIn";
import ConfirmSignUp from "@components/loginComponents/ConfirmSignUp";
import ForgotPassword from "@components/loginComponents/ForgotPassword";
import Greetings from "@components/loginComponents/Greetings";
import RequireNewPassword from "@components/loginComponents/RequireNewPassword";
import SignIn from "@components/loginComponents/SignIn";
import SignUp from "@components/loginComponents/SignUp";
import VerifyContact from "@components/loginComponents/VerifyContact";
import { Ionicons } from "@expo/vector-icons";
import { updateUser } from "@graphql/mutations.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import ReportScreen from "@screens/adminScreens/ReportScreen";
import VerificationRequestsScreen from "@screens/adminScreens/VerificationRequestsScreen";
import ComplianceScreen from "@screens/ComplianceScreen";
import ConversationScreen from "@screens/ConversationScreen";
import CustomSidebarMenu from "@screens/CustomSidebarMenu";
import FriendScreen from "@screens/FriendScreen";
import ImageScreen from "@screens/ImageScreen";
import MessageScreen from "@screens/MessageScreen";
import MyGroupsScreen from "@screens/MyGroupsScreen";
import ProfileScreen from "@screens/ProfileScreen";
import VerificationScreen from "@screens/VerificationScreen";
import MainStack from "@stacks/MainStack";
import SettingsStack from "@stacks/SettingsStack";
import {
  Amplify,
  API,
  Auth,
  Cache,
  graphqlOperation,
  Storage,
} from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react-native";
import { Audio } from "expo-av";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  LogBox,
  Platform,
  UIManager,
  useWindowDimensions,
  View,
} from "react-native";
// Get the aws resources configuration parameters
import awsconfig from "./src/aws-exports"; // if you are using Amplify CLI
import { getUser } from "./src/graphql/queries";

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
  "Non-serializable values were found in the navigation state",
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

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const App = () => {
  //Text.defaultProps = Text.defaultProps || {}
  //Text.defaultProps.style =  { fontFamily: 'Helvetica', fontSize: 15, fontWeight: 'normal' }
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  const [userId, setUserId] = useState("checking..."); //stores the user's id if logged in
  const [isNewUser, setIsNewUser] = useState(false); //stores the user's id if logged in
  const [isAdmin, setIsAdmin] = useState(false); //seems insecure

  const [conversationIds, setConversationIds] = useState([]);

  global.addConversationIds = (id) => {
    //console("(((((((((((((((((((((((((((((((((");
    //console(id);

    const found = conversationIds.find((element) => element == id);

    //console(conversationIds);
    //console("(((((((((((((((((((((((((((((((((");
    //console(found);

    if (found == undefined) {
      //console("inside");

      let tempConversationsIds = conversationIds;
      tempConversationsIds.unshift(id);
      setConversationIds([...tempConversationsIds]);
    }
  };

  const checkIfUserSignedUp = async () => {
    try {
      const query = await Auth.currentAuthenticatedUser();
      if (query.signInUserSession.idToken.payload["cognito:groups"])
        setIsAdmin(
          query.signInUserSession.idToken.payload["cognito:groups"].includes(
            "Admins"
          )
        );
      const user = await API.graphql(
        graphqlOperation(getUser, { id: query.attributes.sub })
      );
      setUserId(query.attributes.sub);
      global.id = query.attributes.sub;
      if (user.data.getUser == null) {
        setIsNewUser(true);
      }

      //console("success, user is ", user);
    } catch (err) {
      console.log("error checking user signed up: ", err);
    }
  };

  const requestAndSaveNotificationPermissions = async () => {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
    });

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    //console(token);

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    // Only update the profile with the expoToken if it not exists yet
    if (token !== "") {
      const inputParams = {
        deviceToken: token,
      };
      await API.graphql(graphqlOperation(updateUser, { input: inputParams }));
    }
  };

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

  const setUniqueConversationIds = (items) => {
    if (JSON.stringify(conversationIds.sort()) !== JSON.stringify(items.sort()))
      //will work when objects are shuffled, but all items will probably refresh still if there's one extra item added to the list
      setConversationIds(items);
  };

  useEffect(() => {
    if (userId !== "checking..." && userId !== "") {
      requestAndSaveNotificationPermissions();
    }
  }, [userId]);

  ////console("App rerendered, userexists is... ", userId == '');
  const dimensions = useWindowDimensions();

  if (userId == "checking...") {
    return (
      <View style={{ flex: 1, backgroundColor: "#a9efe0" }}>
        <ActivityIndicator
          size="large"
          color="#000000"
          style={{
            flex: 1,
            justifyContent: "center",
            flexDirection: "row",
            padding: 10,
          }}
        />
      </View>
    );
  } else if (isNewUser) {
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
            initialParams={{
              newUser: true,
              myId: userId,
              setUserIdFunction: () => setIsNewUser(false),
            }}
            options={
              {
                //headerShown: false,
              }
            }
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  } else if (isAdmin) {
    return (
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen
            name="Report List"
            component={ReportScreen} //should be in a separate app, not this one. we'll make a different app to view reports.
          />
          <Tab.Screen
            name="Verification Requests"
            component={VerificationRequestsScreen} //should be in a separate app, not this one. we'll make a different app to view reports.
          />
        </Tab.Navigator>
      </NavigationContainer>
    );
  } else {
    return (
      <NavigationContainer>
        <StatusBar style="dark" />
        <Drawer.Navigator
          onNavigationStateChange={() => {
            //stop playing all videos when navigating somewhere else
            global.currentVideo = null;
          }}
          drawerPosition={"right"}
          drawerStyle={{ width: dimensions.width }}
          drawerContentOptions={{
            itemStyle: { marginVertical: 5 },
          }}
          backBehavior="initialRoute"
          edgeWidth={100}
          initialRouteName="MainTabs"
          drawerContent={(props) => (
            <CustomSidebarMenu myId={userId} {...props} />
          )}
          screenOptions={headerOptions}
        >
          <Drawer.Screen
            name="Feed"
            component={MainStack}
            initialParams={{ myId: userId, fromLookup: false }}
            options={{ headerShown: false }}
          />
          <Drawer.Screen
            name="Profile"
            component={ProfileScreen}
            initialParams={{ myId: userId }}
          />
          <Drawer.Screen
            name="Verification"
            component={VerificationScreen}
            initialParams={{ myId: userId }}
          />
          <Drawer.Screen
            name="My Groups"
            component={MyGroupsScreen}
            initialParams={{ myId: userId }}
          />
          <Drawer.Screen
            name="Friends"
            component={FriendScreen}
            initialParams={{ myId: userId }}
          />
          <Drawer.Screen
            name="Conversations"
            component={ConversationScreen}
            initialParams={{ myId: userId }}
          />
          <Drawer.Screen
            name="Settings"
            component={SettingsStack}
            initialParams={{ myId: userId }}
          />
          <Drawer.Screen
            name="Image"
            component={ImageScreen}
            initialParams={{ myId: userId }}
          />
          {conversationIds.map((conversationId) => (
            <Drawer.Screen
              key={conversationId}
              name={conversationId}
              component={MessageScreen}
              initialParams={{ myId: userId, userId: conversationId }}
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

export default withAuthenticator(App, false, [
  //this is why we cant have splash screen
  <Greetings />,
  <SignIn />,
  <SignUp />,
  <ConfirmSignIn />,
  <ConfirmSignUp />,
  <VerifyContact />,
  <ForgotPassword />,
  <RequireNewPassword />,
]);
