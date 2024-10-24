import { EventRegionMonitor } from "./RegionMonitoring"

/**
 * An {@link EventRegionMonitor} that always emits true.
 */
export const TrueRegionMonitor: EventRegionMonitor = {
  monitorRegion: (_, callback) => {
    // eslint-disable-next-line n/no-callback-literal
    callback(true)
    return () => {}
  },
  hasArrivedAtRegion: () => true
}
