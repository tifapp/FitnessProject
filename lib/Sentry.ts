import { SENTRY_DSN } from "env"
import * as Sentry from "sentry-expo"

/**
 * Sets up sentry with the default app config.
 */
export const enableSentry = () => {
  // NB: - Ensure that we don't have a client in dev to avoid hot reloading issues.
  if (!__DEV__ || !Sentry.Native.getCurrentHub().getClient()) {
    Sentry.init({
      dsn: SENTRY_DSN,
      enableInExpoDevelopment: true,
      tracesSampleRate: 1
    })
  }
}

/**
 * Disables sentry on an app-wide level.
 */
export const disableSentry = () => {
  Sentry.init({ enabled: false })
}
