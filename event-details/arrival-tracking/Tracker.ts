import { UpcomingEventArrivals } from "./UpcomingArrivals"
import {
  EventArrival,
  EventArrivalOperationKind,
  EventArrivalOperationResult
} from "./WHY_MIO_WHY_WOULD_YOU_DO_THIS_TO_ME_YOU_SAID_YOU_WOULD_BE_BY_MY_SIDE_MIO_ALL_I_DID_I_DID_FOR_YOU"
import {
  EventArrivalGeofencingUpdate,
  EventArrivalGeofencingUnsubscribe,
  EventArrivalsGeofencer
} from "./Geofencing"
import { ArrayUtils } from "@lib/utils/Array"
import { checkIfCoordsAreEqual } from "@location"

export type PerformArrivalsOperation = (
  arrivals: EventArrival[],
  operation: EventArrivalOperationKind
) => Promise<EventArrivalOperationResult[]>

/**
 * A class for tracking upcoming event arrivals.
 *
 * This class acts as a proxy that ensures that all pending arrivals
 * also have their coordinates being geofenced simulataneously, and keeps those
 * sources in sync on a consistent basis.
 */
export class EventArrivalsTracker {
  private readonly upcomingArrivals: UpcomingEventArrivals
  private readonly geofencer: EventArrivalsGeofencer
  private readonly performArrivalsOperation: PerformArrivalsOperation

  private unsubscribeFromGeofencing?: EventArrivalGeofencingUnsubscribe

  constructor (
    upcomingArrivals: UpcomingEventArrivals,
    geofencer: EventArrivalsGeofencer,
    performArrivalsOperation: PerformArrivalsOperation
  ) {
    this.upcomingArrivals = upcomingArrivals
    this.geofencer = geofencer
    this.performArrivalsOperation = performArrivalsOperation
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
    await this.trackArrivals([newArrival])
  }

  async trackArrivals (newArrivals: EventArrival[]) {
    const trackedArrivals = await this.upcomingArrivals.all()
    for (const newArrival of newArrivals) {
      const eventIdIndex = trackedArrivals.findIndex(
        (trackedArrival) => trackedArrival.eventId === newArrival.eventId
      )
      if (eventIdIndex >= 0) {
        trackedArrivals[eventIdIndex] = newArrival
      } else {
        trackedArrivals.push(newArrival)
      }
    }
    await this.syncArrivals(trackedArrivals)
  }

  async removeArrivalByEventId (eventId: number) {
    await this.removeArrivalsByEventIds(new Set([eventId]))
  }

  async removeArrivalsByEventIds (eventIds: Set<number>) {
    const trackedArrivals = await this.upcomingArrivals.all()
    const filteredArrivals = trackedArrivals.filter((arrival) => {
      return !eventIds.has(arrival.eventId)
    })
    if (trackedArrivals.length === filteredArrivals.length) return
    await this.syncArrivals(filteredArrivals)
  }

  /**
   * Starts tracking if there is at least 1 upcoming event arrival.
   */
  async startTracking () {
    const arrivals = await this.upcomingArrivals.all()
    this.updateGeofencingSubscription(arrivals)
  }

  /**
   * Stops tracking all event arrivals in real-time. This will keep upcoming arrivals
   * persisted, but it will not perform any arrival operations on them.
   */
  stopTracking () {
    this.unsubscribeFromGeofencing?.()
  }

  private async handleGeofencingUpdate (update: EventArrivalGeofencingUpdate) {
    const allArrivals = await this.upcomingArrivals.all()
    const arrivalsAtCoordinate = allArrivals.filter((arrival) => {
      return checkIfCoordsAreEqual(arrival.coordinate, update.coordinate)
    })
    if (arrivalsAtCoordinate.length === 0) return

    const results = await this.performArrivalsOperation(
      arrivalsAtCoordinate,
      update.status === "entered" ? "arrived" : "departed"
    )
    const nonUpcomingEventIds = new Set(
      ArrayUtils.compactMap(results, (result) => {
        return result.status === "non-upcoming" ? result.eventId : undefined
      })
    )
    const filteredArrivals = ArrayUtils.compactMap(allArrivals, (arrival) => {
      if (nonUpcomingEventIds.has(arrival.eventId)) {
        return undefined
      }
      const result = results.find(
        (result) => result.eventId === arrival.eventId
      )
      if (result?.status === "outdated-coordinate") {
        return {
          eventId: arrival.eventId,
          coordinate: result.updatedCoordinate
        }
      }
      return arrival
    })
    await this.syncArrivals(filteredArrivals)
  }

  private async syncArrivals (arrivals: EventArrival[]) {
    await Promise.all([
      this.geofencer.replaceGeofencedCoordinates(
        arrivals.map((arrival) => arrival.coordinate)
      ),
      this.upcomingArrivals.replaceAll(arrivals)
    ])
    this.updateGeofencingSubscription(arrivals)
  }

  private updateGeofencingSubscription (arrivals: EventArrival[]) {
    if (arrivals.length === 0) {
      this.stopTracking()
    } else {
      this.unsubscribeFromGeofencing = this.geofencer.onUpdate((update) => {
        this.handleGeofencingUpdate(update)
      })
    }
  }
}
