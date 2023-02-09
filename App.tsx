// aws
import API, { GraphQLQuery } from "@aws-amplify/api";
import { Amplify, Auth, Cache, graphqlOperation, Storage } from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react-native";
import awsconfig from "./src/aws-exports";

import { AmplifyGraphQLOperations } from "@lib/GraphQLOperations";

// graphql
import { updateUser } from "@graphql/mutations.js";
import { User } from "src/models";
import { getUser } from "./src/graphql/queries";

// components
import { headerOptions } from "@components/headerComponents/headerOptions";

// navigation
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  createDrawerNavigator,
  DrawerNavigationOptions,
} from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import ChallengeStack from "@screens/adminScreens/ChallengeStack";
import ReportScreen from "@screens/adminScreens/ReportScreen";
import VerificationRequestsScreen from "@screens/adminScreens/VerificationRequestsScreen";
import ComplianceScreen from "@screens/ComplianceScreen";
import ConversationScreen from "@screens/ConversationScreen";
import CustomSidebarMenu from "@screens/CustomSidebarMenu";
import FriendScreen from "@screens/FriendScreen";
import ImageScreen from "@screens/ImageScreen";
import MessageScreen from "@screens/MessageScreen";
import ProfileScreen from "@screens/ProfileScreen";
import VerificationScreen from "@screens/VerificationScreen";
import MainStack from "@stacks/MainStack";
import SettingsStack from "@stacks/SettingsStack";

// react
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  AppStateStatus,
  Platform,
  UIManager,
  useWindowDimensions,
  View,
} from "react-native";

// sign in
import ConfirmSignIn from "@components/loginComponents/ConfirmSignIn";
import ConfirmSignUp from "@components/loginComponents/ConfirmSignUp";
import ForgotPassword from "@components/loginComponents/ForgotPassword";
import Greetings from "@components/loginComponents/Greetings";
import RequireNewPassword from "@components/loginComponents/RequireNewPassword";
import SignIn from "@components/loginComponents/SignIn";
import SignUp from "@components/loginComponents/SignUp";
import VerifyContact from "@components/loginComponents/VerifyContact";
import { makeLinkingConfig } from "@lib/linkingConfig";
import { ExpoUserNotifications } from "@lib/UserNotifications";
import ActivitiesScreen from "@screens/ActivitiesScreen";
import { SetDependencyValue } from "./lib/dependencies";
import { userIdDependencyKey } from "./lib/MiscDependencyKeys";

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

Amplify.configure({
  awsconfig,
  Analytics: {
    disabled: true, // for some reason this removes the unhandled promise rejection error on startup
  },
});
Auth.configure(awsconfig);
API.configure(awsconfig);
Storage.configure(awsconfig);

const config = {
  storage: AsyncStorage,
  capacityInBytes: 5000000,
};

Cache.configure(config);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// TODO: - One day, we may get this under test...

const graphqlOperations = new AmplifyGraphQLOperations();
const userNotifications = new ExpoUserNotifications();
const linkingConfig = makeLinkingConfig({ userNotifications });

const App = () => {
  // Text.defaultProps = Text.defaultProps || {}
  // Text.defaultProps.style =  { fontFamily: 'Helvetica', fontSize: 15, fontWeight: 'normal' }
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  const [userId, setUserId] = useState<string>("checking..."); // stores the user's id if logged in
  const [isNewUser, setIsNewUser] = useState<boolean>(false); // stores the user's id if logged in
  const [isAdmin, setIsAdmin] = useState<boolean>(false); // seems insecure
  const [isDeveloper, setIsDeveloper] = useState<boolean>(false);

  const [conversationIds, setConversationIds] = useState<string[]>([]);

  globalThis.addConversationIds = (id) => {
    // console("(((((((((((((((((((((((((((((((((");
    // console(id);

    const found = conversationIds.find((element) => element == id);

    // console(conversationIds);
    // console("(((((((((((((((((((((((((((((((((");
    // console(found);

    if (found == undefined) {
      // console("inside");

      const tempConversationsIds = conversationIds;
      tempConversationsIds.unshift(id);
      setConversationIds([...tempConversationsIds]);
    }
  };

  const checkIfUserSignedUp = async () => {
    try {
      const query = await Auth.currentAuthenticatedUser();
      const groups =
        query?.signInUserSession?.idToken?.payload?.["cognito:groups"];
      if (groups) {
        if (groups.includes("Admins")) {
          setIsAdmin(true);
        }
        if (groups.includes("test_users")) {
          setIsDeveloper(true);
        }
      }
      setUserId(query.attributes.sub);

      globalThis.myId = query.attributes.sub;
      const user = await API.graphql<GraphQLQuery<{ getUser: User }>>(
        graphqlOperation(getUser, { id: query.attributes.sub })
      );
      if (user.data?.getUser == null) {
        setIsNewUser(true);
      }

      // console("success, user is ", user);
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
      Alert.alert("Failed to get push token for push notification!");
      return;
    }
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    // console(token);

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
    const appStateSubscription = AppState.addEventListener(
      "change",
      _handleAppStateChange
    );
    checkIfUserSignedUp();

    return () => {
      appStateSubscription.remove();
    };
  }, []);

  const _handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (
      nextAppState.match(/inactive|background/) &&
      appState.current === "active"
    ) {
      Cache.setItem("lastOnline", Date.now(), { priority: 1 });
    }

    appState.current = nextAppState;
    setAppStateVisible(appState.current);
  };

  const setUniqueConversationIds = (items: [string]) => {
    if (
      JSON.stringify(conversationIds.sort()) !== JSON.stringify(items.sort())
    ) {
      // will work when objects are shuffled, but all items will probably refresh still if there's one extra item added to the list
      setConversationIds(items);
    }
  };

  useEffect(() => {
    if (userId !== "checking..." && userId !== "") {
      requestAndSaveNotificationPermissions();
    }
  }, [userId]);

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
              setUserIdFunction: () => setIsNewUser(false),
            }}
            options={
              {
                // headerShown: false,
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
            component={ReportScreen} // should be in a separate app, not this one. we'll make a different app to view reports.
          />
          <Tab.Screen
            name="Verification Requests"
            component={VerificationRequestsScreen} // should be in a separate app, not this one. we'll make a different app to view reports.
          />
          <Tab.Screen
            name="Challenges"
            component={ChallengeStack} // should be in a separate app, not this one. we'll make a different app to view reports.
          />
        </Tab.Navigator>
      </NavigationContainer>
    );
  } else if (isDeveloper) {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Activities Screen"
            component={ActivitiesScreen}
            options={{
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  } else {
    return (
      <SetDependencyValue forKey={userIdDependencyKey} value={userId}>
        <NavigationContainer linking={linkingConfig}>
          <StatusBar style="dark" />
          <Drawer.Navigator
            drawerPosition={"right"}
            drawerStyle={{ width: dimensions.width }}
            drawerContentOptions={{
              itemStyle: { marginVertical: 5 },
            }}
            backBehavior="initialRoute"
            edgeWidth={100}
            initialRouteName="MainTabs"
            drawerContent={(props) => <CustomSidebarMenu {...props} />}
            screenOptions={headerOptions as DrawerNavigationOptions}
          >
            <Drawer.Screen
              name="Feed"
              component={MainStack}
              initialParams={{ fromLookup: false }}
              options={{ headerShown: false }}
            />
            <Drawer.Screen name="Profile" component={ProfileScreen} />
            <Drawer.Screen name="Verification" component={VerificationScreen} />
            <Drawer.Screen name="Friends" component={FriendScreen} />
            <Drawer.Screen
              name="Conversations"
              component={ConversationScreen}
            />
            <Drawer.Screen name="Settings" component={SettingsStack} />
            <Drawer.Screen name="Image" component={ImageScreen} />
            {conversationIds.map((conversationId) => (
              <Drawer.Screen
                key={conversationId}
                name={conversationId}
                component={MessageScreen}
                initialParams={{ conversationId }}
              />
            ))}
          </Drawer.Navigator>
        </NavigationContainer>
      </SetDependencyValue>
    );
  }
};

export default withAuthenticator(App, false, [
  <Greetings />,
  <SignIn />,
  <SignUp />,
  <ConfirmSignIn />,
  <ConfirmSignUp />,
  <VerifyContact />,
  <ForgotPassword />,
  <RequireNewPassword />,
]);
