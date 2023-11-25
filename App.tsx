import { TiFMenuProvider } from "@components/TiFMenuProvider"
import { TiFQueryClientProvider } from "@components/TiFQueryClientProvider"
import { useAppFonts } from "@hooks/Fonts"
import { UserLocationFunctionsProvider } from "@hooks/UserLocation"
import {
  HapticsProvider,
  IS_HAPTICS_SUPPORTED_ON_DEVICE,
  TiFHaptics
} from "@lib/Haptics"
import {
  getCurrentPositionAsync,
  requestForegroundPermissionsAsync
} from "expo-location"
import React from "react"
import { RootSiblingParent } from "react-native-root-siblings"
import { SafeAreaProvider } from "react-native-safe-area-context"

import { Geo } from "@aws-amplify/geo"
import { AnalyticsProvider, MixpanelAnalytics } from "@lib/Analytics"
import {
  addLogHandler,
  createLogFunction,
  sentryBreadcrumbLogHandler,
  sentryErrorCapturingLogHandler
} from "@lib/Logging"
import { enableSentry } from "@lib/Sentry"
import { AppView } from "root-feature/AppView"
import "expo-dev-client"
import { Native as SentryNative } from "sentry-expo"
import { setupCognito } from "./auth"
import awsconfig from "./src/aws-exports"

Geo.configure(awsconfig)
setupCognito()
enableSentry()

const log = createLogFunction("app.root")
addLogHandler(sentryBreadcrumbLogHandler())
addLogHandler(sentryErrorCapturingLogHandler())

log("info", "App launched", { date: new Date() })

const App = () => {
  const [isFontsLoaded] = useAppFonts()
  return (
    <TiFQueryClientProvider>
      <UserLocationFunctionsProvider
        getCurrentLocation={getCurrentPositionAsync}
        requestForegroundPermissions={requestForegroundPermissionsAsync}
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

export default SentryNative.wrap(App)
