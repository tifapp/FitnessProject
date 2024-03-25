import { EventArrivalRegion } from "@shared-models/EventArrivals"

export type EventArrivalGeofencedRegion = Omit<EventArrivalRegion, "eventIds">

export type EventArrivalGeofencingCallback = (
  update: EventArrivalGeofencedRegion
) => void

export type EventArrivalGeofencingUnsubscribe = () => void

/**
 * A geofencer interface explicitly tuned for event arrivals.
 */
export interface EventArrivalsGeofencer {
  /**
   * Replaces all arrivals currently being geofenced.
   */
  replaceGeofencedRegions: (
    regions: EventArrivalGeofencedRegion[]
  ) => Promise<void>

  /**
   * Registers a callback that listens for geofencing updates.
   */
  onUpdate: (
    handleUpdate: EventArrivalGeofencingCallback
  ) => EventArrivalGeofencingUnsubscribe
}
