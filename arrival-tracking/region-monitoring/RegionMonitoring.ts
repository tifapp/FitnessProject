/* eslint-disable func-call-spacing */
import { EventRegion } from "TiFShared/domain-models/Event"
import { useCallback, useSyncExternalStore } from "react"
import { featureContext } from "@lib/FeatureContext"
import { LocationCoordinate2D } from "TiFShared/domain-models/LocationCoordinate2D"
import { watchPositionAsync, LocationAccuracy } from "expo-location"
import { ForegroundEventRegionMonitor } from "./ForegroundRegionMonitor"

export type EventRegionMonitorUnsubscribe = () => void

/**
 * An interface for monitoring whether or not the user has arrived from a
 * particular region.
 */
export interface EventRegionMonitor {
  /**
   * Begins monitoring the given region. The callback should be invoked
   * initially with the current arrival status, and then should invoke the
   * callback whenever a further update is received. Duplicate statuses should
   * not be published.
   */
  monitorRegion(
    region: EventRegion,
    callback: (hasArrived: boolean) => void
  ): EventRegionMonitorUnsubscribe

  hasArrivedAtRegion(region: EventRegion): boolean
}

// TODO: - Live Context

const watchLocation = async (
  callback: (coordinate: LocationCoordinate2D) => void
) => {
  return await watchPositionAsync(
    { accuracy: LocationAccuracy.Highest },
    (location) => callback(location.coords)
  )
}

export const RegionMonitorContext = featureContext({
  monitor: new ForegroundEventRegionMonitor(watchLocation)
})

export const useHasArrivedAtRegion = (
  region: EventRegion,
  monitor: EventRegionMonitor
) => {
  return useSyncExternalStore(
    useCallback(
      (callback) => monitor.monitorRegion(region, callback),
      [monitor, region]
    ),
    () => monitor.hasArrivedAtRegion(region)
  )
}
