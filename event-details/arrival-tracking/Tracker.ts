import { LocationCoordinate2D } from "@lib/location"
import { UpcomingEventArrivals } from "./UpcomingArrivals"
import { EventArrival } from "./models"

/**
 * A class for tracking upcoming event arrivals.
 *
 * This class acts as a proxy that ensures that all pending arrivals
 * also have their coordinates being geofenced simulataneously, and keeps those
 * sources in sync on a consistent basis.
 */
export class EventArrivalsTracker {
  private readonly upcomingArrivals: UpcomingEventArrivals
  private readonly replaceGeofencedCoordinates: (
    events: LocationCoordinate2D[]
  ) => void

  constructor (
    upcomingArrivals: UpcomingEventArrivals,
    replaceGeofencedCoordinates: (coordinates: LocationCoordinate2D[]) => void
  ) {
    this.upcomingArrivals = upcomingArrivals
    this.replaceGeofencedCoordinates = replaceGeofencedCoordinates
  }

  /**
   * Refreshes the upcoming arrivals.
   *
   * @param fetchUpcomingArrivals a function to fetch the upcoming {@link EventArrival}s.
   */
  async refreshArrivals (fetchUpcomingArrivals: () => Promise<EventArrival[]>) {
    await this.syncArrivals(await fetchUpcomingArrivals())
  }

  /**
   * Adds an {@link EventArrival} to tracking.
   *
   * If an arrival exists with the same event id, then that arrival is updated instead of added.
   */
  async trackArrival (newArrival: EventArrival) {
    const trackedArrivals = await this.upcomingArrivals.all()
    const eventIdIndex = trackedArrivals.findIndex(
      (trackedArrival) => trackedArrival.eventId === newArrival.eventId
    )
    if (eventIdIndex >= 0) {
      trackedArrivals[eventIdIndex] = newArrival
    } else {
      trackedArrivals.push(newArrival)
    }
    await this.syncArrivals(trackedArrivals)
  }

  async removeArrivalByEventId (eventId: number) {
    const trackedArrivals = await this.upcomingArrivals.all()
    const filteredArrivals = trackedArrivals.filter(
      (arrival) => arrival.eventId !== eventId
    )
    if (trackedArrivals.length === filteredArrivals.length) return
    await this.syncArrivals(filteredArrivals)
  }

  private async syncArrivals (arrivals: EventArrival[]) {
    this.replaceGeofencedCoordinates(
      arrivals.map((arrival) => arrival.coordinate)
    )
    await this.upcomingArrivals.replaceAll(arrivals)
  }
}
