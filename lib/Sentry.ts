import { SENTRY_DSN } from "@env"
import * as Sentry from "@sentry/react-native"
import { allSettledShim } from "./utils/Promise"

/**
 * Sets up sentry with the default app config.
 */
export const enableSentry = () => {
  // NB: - Ensure that we don't have a client in dev to avoid hot reloading issues.
  if (!__DEV__ || !Sentry.getCurrentHub().getClient()) {
    Sentry.init({
      dsn: SENTRY_DSN,
      tracesSampleRate: 1
    })

    // sentry overrides the global promise polyfill, must apply afterwards
    // https://docs.sentry.io/platforms/react-native/troubleshooting/#using-with-other-polyfills
    allSettledShim()
  }
}

/**
 * Disables sentry on an app-wide level.
 */
export const disableSentry = () => {
  Sentry.init({ enabled: false })
}
