import { MIXPANEL_TOKEN } from "env"
import { Mixpanel } from "mixpanel-react-native"
import React, { ReactNode, createContext, useContext } from "react"
import { JSONSerializableValue } from "./JSONSerializable"

/**
 * A type for representing metadata sent with analytic events. Metadata must contain
 * string keys whose values extend {@link JSONSerializableValue}.
 */
export type AnalyticsMetadata = { [key: string]: JSONSerializableValue }

/**
 * An interface for analytics operations.
 */
export interface Analytics {
  /**
   * Tracks a given analytics event given its name and some metadata (which should be JSON serializable).
   *
   * @param name the name of the event to track, must be a non-empty string.
   * @param metadata {@link AnalyticsMetadata}, must be JSON serializable.
   */
  track(name: string, metadata?: AnalyticsMetadata): void

  /**
   * Opts the user out of analytics tracking if they are opted in.
   */
  optOut(): void

  /**
   * Opts the user into analytics tracking if they are opted out.
   */
  optIn(): void
}

/**
 * An {@link Analytics} implementation using Mixpanel.
 *
 * This class required the `MIXPANEL_TOKEN` environment variable to be set in `.env`.
 */
export class MixpanelAnalytics implements Analytics {
  static shared = new MixpanelAnalytics()

  private readonly mixpanel: Mixpanel

  private constructor () {
    this.mixpanel = new Mixpanel(MIXPANEL_TOKEN, true)
    this.mixpanel.init()
  }

  track (name: string, metadata?: AnalyticsMetadata) {
    this.mixpanel.track(name, metadata)
  }

  optOut () {
    this.mixpanel.optOutTracking()
  }

  optIn () {
    this.mixpanel.optInTracking()
  }
}

const AnalyticsContext = createContext<Analytics | undefined>(undefined)

/**
 * Uses the current {@link Analytics} implementation provided by {@link AnalyticsProvider}.
 */
export const useAnalytics = () => useContext(AnalyticsContext)!

export type AnalyticsProviderProps = {
  analytics: Analytics
  children: ReactNode
}

/**
 * Provides an {@link Analytics} implementation to a component subtree.
 */
export const AnalyticsProvider = ({
  analytics,
  children
}: AnalyticsProviderProps) => (
  <AnalyticsContext.Provider value={analytics}>
    {children}
  </AnalyticsContext.Provider>
)
