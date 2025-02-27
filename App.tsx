import "@api"
import "date-time/DateRangeFormatting"
import { useAppFonts } from "@lib/Fonts"
import React from "react"
import { StyleSheet } from "react-native"

import { Geo } from "@aws-amplify/geo"
import { ExpoEventArrivalsGeofencer } from "@arrival-tracking/geofencing"
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
import { TiFView } from "@core-root"
import * as Sentry from "@sentry/react-native"
import "expo-dev-client"
import { addPushTokenListener } from "expo-notifications"
import { setupCognito } from "@auth-boundary"
import { registerForPushNotifications } from "./notifications"
import awsconfig from "./src/aws-exports"
import { NetInfoInternetConnectionStatus } from "@lib/InternetConnection"
import { consoleLogHandler, logger, addLogHandler } from "TiFShared/logging"
import { dayjs } from "TiFShared/lib/Dayjs"
import { eventsByRegion } from "@explore-events-boundary"
import { AlphaUserSessionProvider, AlphaUserStorage } from "@user/alpha"
import { LiveEventsStore } from "@event/LiveEvents"

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
    <AlphaUserSessionProvider>
      <TiFView
        fetchEvents={eventsByRegion}
        isFontsLoaded={isFontsLoaded}
        style={styles.tif}
      />
    </AlphaUserSessionProvider>
  )
}

const styles = StyleSheet.create({
  tif: { flex: 1 }
})

export default Sentry.wrap(TiFApp)
