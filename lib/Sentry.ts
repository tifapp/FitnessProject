import { SENTRY_DSN } from "env"
import * as Sentry from "sentry-expo"

/**
 * Sets up sentry with the default app config.
 *
 * @param isEnabled whether or not the user has enabled crash reporting.
 */
export const setupSentry = (isEnabled: boolean = true) => {
  Sentry.init({
    dsn: SENTRY_DSN,
    enabled: isEnabled,
    enableInExpoDevelopment: true,
    tracesSampleRate: 1
  })
}
