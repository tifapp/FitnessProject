import { UpcomingEventArrivals } from "./UpcomingArrivals"
import { EventArrival } from "@shared-models/EventArrivals"
import {
  EventArrivalGeofencingUpdate,
  EventArrivalGeofencingUnsubscribe,
  EventArrivalsGeofencer
} from "./Geofencing"
import { ArrayUtils } from "@lib/utils/Array"
import { checkIfCoordsAreEqual } from "@location"
import { PerformArrivalsOperation } from "./ArrivalOperation"

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
    await this.editAllUpcomingArrivals((arrivals) => {
      for (const newArrival of newArrivals) {
        const eventIdIndex = arrivals.findIndex(
          (arrival) => arrival.eventId === newArrival.eventId
        )
        if (eventIdIndex >= 0) {
          arrivals[eventIdIndex] = newArrival
        } else {
          arrivals.push(newArrival)
        }
      }
      return arrivals
    })
  }

  async removeArrivalByEventId (eventId: number) {
    await this.removeArrivalsByEventIds(new Set([eventId]))
  }

  async removeArrivalsByEventIds (eventIds: Set<number>) {
    await this.editAllUpcomingArrivals((arrivals) => {
      return arrivals.filter((arrival) => !eventIds.has(arrival.eventId))
    })
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
    this.unsubscribeFromGeofencing = undefined
  }

  private async handleGeofencingUpdate (update: EventArrivalGeofencingUpdate) {
    await this.editAllUpcomingArrivals(async (arrivals) => {
      const arrivalsAtCoordinate = arrivals.filter((arrival) => {
        return checkIfCoordsAreEqual(arrival.coordinate, update.coordinate)
      })
      if (arrivalsAtCoordinate.length === 0) return arrivals

      const results = await this.performArrivalsOperation(
        arrivalsAtCoordinate,
        update.status === "entered" ? "arrived" : "departed"
      )
      const nonUpcomingEventIds = ArrayUtils.compactMap(results, (result) => {
        return result.status === "remove-from-tracking"
          ? result.eventId
          : undefined
      })
      return ArrayUtils.compactMap(arrivals, (arrival) => {
        if (nonUpcomingEventIds.includes(arrival.eventId)) return undefined
        const result = results.find(
          (result) => result.eventId === arrival.eventId
        )
        if (result?.status === "outdated-coordinate") {
          arrival.coordinate = result.updatedCoordinate
        }
        return arrival
      })
    })
  }

  private async editAllUpcomingArrivals (
    work: (arrivals: EventArrival[]) => Promise<EventArrival[]> | EventArrival[]
  ) {
    await this.syncArrivals(await work(await this.upcomingArrivals.all()))
  }

  private async syncArrivals (arrivals: EventArrival[]) {
    await Promise.all([
      this.geofencer.replaceGeofencedArrivals(arrivals),
      this.upcomingArrivals.replaceAll(arrivals)
    ])
    this.updateGeofencingSubscription(arrivals)
  }

  private updateGeofencingSubscription (arrivals: EventArrival[]) {
    this.stopTracking()
    if (arrivals.length > 0) {
      this.unsubscribeFromGeofencing = this.geofencer.onUpdate((update) => {
        this.handleGeofencingUpdate(update)
      })
    }
  }
}
