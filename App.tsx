import { TiFMenuProvider } from "@components/TiFMenuProvider"
import { TiFQueryClientProvider } from "@components/TiFQueryClientProvider"
import { useAppFonts } from "@hooks/Fonts"
import { UserLocationFunctionsProvider } from "@hooks/UserLocation"
import { HapticsProvider, PersistentHaptics } from "@lib/Haptics"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { TabNavigation } from "@stacks/ActivitiesStack"
import {
  getCurrentPositionAsync,
  requestForegroundPermissionsAsync
} from "expo-location"
import React from "react"
import { RootSiblingParent } from "react-native-root-siblings"
import { SafeAreaProvider } from "react-native-safe-area-context"

import { withAuthenticator } from "aws-amplify-react-native"

import { Geo } from "@aws-amplify/geo"
import ConfirmSignIn from "@components/loginComponents/ConfirmSignIn"
import ConfirmSignUp from "@components/loginComponents/ConfirmSignUp"
import ForgotPassword from "@components/loginComponents/ForgotPassword"
import Greetings from "@components/loginComponents/Greetings"
import RequireNewPassword from "@components/loginComponents/RequireNewPassword"
import SignIn from "@components/loginComponents/SignIn"
import SignUp from "@components/loginComponents/SignUp"
import VerifyContact from "@components/loginComponents/VerifyContact"
import {
  addLogHandler,
  createLogFunction,
  sentryBreadcrumbLogHandler,
  sentryErrorCapturingLogHandler
} from "@lib/Logging"
import { enableSentry } from "@lib/Sentry"
import { Auth } from "aws-amplify"
import { Native as SentryNative } from "sentry-expo"
import awsconfig from "./src/aws-exports"
Geo.configure(awsconfig)
Auth.configure(awsconfig)

enableSentry()

const log = createLogFunction("app.root")
addLogHandler(sentryBreadcrumbLogHandler())
addLogHandler(sentryErrorCapturingLogHandler())

log("info", "App launched", { date: new Date() })

const Stack = createStackNavigator()

export type AppProps = {
  isFontsLoaded: boolean
}

const AppView = ({ isFontsLoaded }: AppProps) => {
  if (!isFontsLoaded) return null // TODO: - Splash Screen?
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Activities Screen"
          component={TabNavigation}
          options={{
            headerShown: false
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const haptics = new PersistentHaptics()

const App = () => {
  const [isFontsLoaded] = useAppFonts()
  return (
    <TiFQueryClientProvider>
      <HapticsProvider haptics={haptics}>
        <UserLocationFunctionsProvider
          getCurrentLocation={getCurrentPositionAsync}
          requestForegroundPermissions={requestForegroundPermissionsAsync}
        >
          <SafeAreaProvider>
            <TiFMenuProvider>
              <RootSiblingParent>
                <AppView isFontsLoaded={isFontsLoaded} />
              </RootSiblingParent>
            </TiFMenuProvider>
          </SafeAreaProvider>
        </UserLocationFunctionsProvider>
      </HapticsProvider>
    </TiFQueryClientProvider>
  )
}

export default SentryNative.wrap(
  withAuthenticator(App, false, [
    <Greetings />,
    <SignIn />,
    <SignUp />,
    <ConfirmSignIn />,
    <ConfirmSignUp />,
    <VerifyContact />,
    <ForgotPassword />,
    <RequireNewPassword />
  ])
)
