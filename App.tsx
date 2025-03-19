import "@api"
import { useAppFonts } from "@lib/Fonts"
import "date-time/DateRangeFormatting"
import React from "react"
import { StyleSheet } from "react-native"

import { ExpoEventArrivalsGeofencer } from "@arrival-tracking/geofencing"
import { setupCognito } from "@auth-boundary"
import { Geo } from "@aws-amplify/geo"
import { TiFView } from "@core-root"
import { LiveEventsStore } from "@event/LiveEvents"
import { eventsByRegion } from "@explore-events-boundary"
import { PortalProvider } from "@gorhom/portal"
import { NetInfoInternetConnectionStatus } from "@lib/InternetConnection"
import {
  sentryBreadcrumbLogHandler,
  sentryErrorCapturingLogHandler,
  sqliteLogHandler,
  sqliteLogs
} from "@lib/Logging"
import {
  setupFocusRefreshes,
  setupInternetReconnectionRefreshes
} from "@lib/ReactQuery"
import { enableSentry } from "@lib/Sentry"
import * as Sentry from "@sentry/react-native"
import { AlphaUserSessionProvider, AlphaUserStorage } from "@user/alpha"
import "expo-dev-client"
import { addPushTokenListener } from "expo-notifications"
import { dayjs } from "TiFShared/lib/Dayjs"
import { addLogHandler, consoleLogHandler, logger } from "TiFShared/logging"
import { registerForPushNotifications } from "./notifications"
import awsconfig from "./src/aws-exports"

const log = logger("app.root")

/**
 * Performs all the necessary setup (starting background tasks, configuration,
 * etc.) for the app that does not have to do directly with the UI.
 */
export const setupApp = () => {
  enableSentry()
  addLogHandler(consoleLogHandler())
  addLogHandler(sentryBreadcrumbLogHandler())
  addLogHandler(sentryErrorCapturingLogHandler())
  addLogHandler(
    sqliteLogHandler(sqliteLogs, dayjs.duration(2, "weeks").asSeconds())
  )
  log.info("App launched", { date: new Date() })
  setupCognito()
  Geo.configure(awsconfig)
  ExpoEventArrivalsGeofencer.shared.defineTask()
  addPushTokenListener(registerForPushNotifications)
  setupInternetReconnectionRefreshes(NetInfoInternetConnectionStatus.shared)
  setupFocusRefreshes()
  LiveEventsStore.default.observeUserChanges(AlphaUserStorage.default)
}

export type AppProps = {
  isFontsLoaded: boolean
}

const TiFApp = () => {
  const [isFontsLoaded] = useAppFonts()
  return (
    <PortalProvider>
      <AlphaUserSessionProvider>
        <TiFView
          fetchEvents={eventsByRegion}
          isFontsLoaded={isFontsLoaded}
          style={styles.tif}
        />
      </AlphaUserSessionProvider>
    </PortalProvider>
  )
}

const styles = StyleSheet.create({
  tif: { flex: 1 }
})

export default Sentry.wrap(TiFApp)
