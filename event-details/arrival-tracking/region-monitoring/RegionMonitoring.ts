/* eslint-disable func-call-spacing */
import { EventRegion } from "@shared-models/Event"
import { useSyncExternalStore } from "react"

export type EventRegionMonitorUnsubscribe = () => void

/**
 * An interface for monitoring whether or not the user has arrived from a
 * particular region.
 */
export interface EventRegionMonitor {
  /**
   * Begins monitoring the given region. The callback should be invoked
   * immediately with the inital arrival status.
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
    (callback) => monitor.monitorRegion(region, callback),
    () => monitor.hasArrivedAtRegion(region)
  )
}
