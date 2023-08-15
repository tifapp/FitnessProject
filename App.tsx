import React from "react"
import { RootSiblingParent } from "react-native-root-siblings"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { TiFQueryClientProvider } from "@components/TiFQueryClientProvider"
import { useAppFonts } from "@hooks/Fonts"
import { TabNavigation } from "@stacks/ActivitiesStack"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { TiFMenuProvider } from "@components/TiFMenuProvider"
import { UserLocationFunctionsProvider } from "@hooks/UserLocation"
import {
  getCurrentPositionAsync,
  requestForegroundPermissionsAsync
} from "expo-location"
import { Native as SentryNative } from "sentry-expo"
import { enableSentry } from "@lib/Sentry"
import {
  addLogHandler,
  createLogFunction,
  sentryBreadcrumbLogHandler,
  sentryErrorCapturingLogHandler
} from "@lib/Logging"

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

const App = () => {
  const [isFontsLoaded] = useAppFonts()
  return (
    <TiFQueryClientProvider>
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
    </TiFQueryClientProvider>
  )
}

export default SentryNative.wrap(App)
