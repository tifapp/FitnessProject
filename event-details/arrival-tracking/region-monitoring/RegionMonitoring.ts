/* eslint-disable func-call-spacing */
import { EventRegion } from "@shared-models/Event"
import { useCallback, useSyncExternalStore } from "react"

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
