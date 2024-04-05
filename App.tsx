import { TiFMenuProvider } from "@components/TiFMenuProvider"
import { useAppFonts } from "@lib/Fonts"
import React from "react"
import { RootSiblingParent } from "react-native-root-siblings"
import { SafeAreaProvider } from "react-native-safe-area-context"

import { Geo } from "@aws-amplify/geo"
import { ExpoEventArrivalsGeofencer } from "@arrival-tracking/geofencing"
import {
  addLogHandler,
  createLogFunction,
  sentryBreadcrumbLogHandler,
  sentryErrorCapturingLogHandler
} from "@lib/Logging"
import {
  TiFQueryClientProvider,
  setupFocusRefreshes,
  setupInternetReconnectionRefreshes
} from "@lib/ReactQuery"
import { enableSentry } from "@lib/Sentry"
import { AppView } from "@core-root/AppView"
import * as Sentry from "@sentry/react-native"
import "expo-dev-client"
import { addPushTokenListener } from "expo-notifications"
import { setupCognito } from "@auth-boundary"
import { registerForPushNotifications } from "./notifications"
import awsconfig from "./src/aws-exports"
import { NetInfoInternetConnectionStatus } from "@lib/InternetConnection"
import "TiFShared"

const log = createLogFunction("app.root")

/**
 * Performs all the necessary setup (starting background tasks, configuration,
 * etc.) for the app that does not have to do directly with the UI.
 */
export const setupApp = () => {
  enableSentry()
  addLogHandler(sentryBreadcrumbLogHandler())
  addLogHandler(sentryErrorCapturingLogHandler())
  log("info", "App launched", { date: new Date() })
  setupCognito()
  Geo.configure(awsconfig)
  ExpoEventArrivalsGeofencer.shared.defineTask()
  addPushTokenListener(registerForPushNotifications)
  setupInternetReconnectionRefreshes(NetInfoInternetConnectionStatus.shared)
  setupFocusRefreshes()
}

export type AppProps = {
  isFontsLoaded: boolean
}

const App = () => {
  const [isFontsLoaded] = useAppFonts()
  return (
    <TiFQueryClientProvider>
      <SafeAreaProvider>
        <TiFMenuProvider>
          <RootSiblingParent>
            <AppView isFontsLoaded={isFontsLoaded} />
          </RootSiblingParent>
        </TiFMenuProvider>
      </SafeAreaProvider>
    </TiFQueryClientProvider>
  )
}

export default Sentry.wrap(App)
