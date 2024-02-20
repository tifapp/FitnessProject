import { TiFMenuProvider } from "@components/TiFMenuProvider"
import { useAppFonts } from "@lib/Fonts"
import {
  HapticsProvider,
  IS_HAPTICS_SUPPORTED_ON_DEVICE,
  TiFHaptics
} from "@lib/Haptics"
import { UserLocationFunctionsProvider } from "@location/UserLocation"
import {
  getCurrentPositionAsync,
  requestBackgroundPermissionsAsync,
  requestForegroundPermissionsAsync
} from "expo-location"
import React from "react"
import { RootSiblingParent } from "react-native-root-siblings"
import { SafeAreaProvider } from "react-native-safe-area-context"

import { Geo } from "@aws-amplify/geo"
import { ExpoEventArrivalsGeofencer } from "@event-details/arrival-tracking"
import { AnalyticsProvider, MixpanelAnalytics } from "@lib/Analytics"
import {
  addLogHandler,
  createLogFunction,
  sentryBreadcrumbLogHandler,
  sentryErrorCapturingLogHandler
} from "@lib/Logging"
import { TiFQueryClientProvider } from "@lib/ReactQuery"
import { enableSentry } from "@lib/Sentry"
import { AppView } from "@root-feature/AppView"
import * as Sentry from "@sentry/react-native"
import "expo-dev-client"
import { addPushTokenListener } from "expo-notifications"
import { setupCognito } from "./auth"
import { registerForPushNotifications } from "./notifications"
import awsconfig from "./src/aws-exports"

/**
 * Performs all the necessary setup (starting background tasks, configuration,
 * etc.) for the app that does not have to do directly with the UI.
 */
export const setupApp = () => {
  const log = createLogFunction("app.root")
  enableSentry()
  addLogHandler(sentryBreadcrumbLogHandler())
  addLogHandler(sentryErrorCapturingLogHandler())
  log("info", "App launched", { date: new Date() })
  setupCognito()
  Geo.configure(awsconfig)
  ExpoEventArrivalsGeofencer.shared.defineTask()
  addPushTokenListener(registerForPushNotifications)
}

export type AppProps = {
  isFontsLoaded: boolean
}

const App = () => {
  const [isFontsLoaded] = useAppFonts()
  return (
    <TiFQueryClientProvider>
      <UserLocationFunctionsProvider
        getCurrentLocation={getCurrentPositionAsync}
        requestForegroundPermissions={requestForegroundPermissionsAsync}
        requestBackgroundPermissions={requestBackgroundPermissionsAsync}
      >
        <HapticsProvider
          isSupportedOnDevice={IS_HAPTICS_SUPPORTED_ON_DEVICE}
          haptics={TiFHaptics}
        >
          <AnalyticsProvider analytics={MixpanelAnalytics.shared}>
            <SafeAreaProvider>
              <TiFMenuProvider>
                <RootSiblingParent>
                  <AppView isFontsLoaded={isFontsLoaded} />
                </RootSiblingParent>
              </TiFMenuProvider>
            </SafeAreaProvider>
          </AnalyticsProvider>
        </HapticsProvider>
      </UserLocationFunctionsProvider>
    </TiFQueryClientProvider>
  )
}

export default Sentry.wrap(App)
