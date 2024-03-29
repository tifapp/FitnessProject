import { UpcomingEventArrivals } from "./UpcomingArrivals"
import { EventArrivalRegion } from "@shared-models/EventArrivals"
import {
  EventArrivalGeofencedRegion,
  EventArrivalGeofencingUnsubscribe,
  EventArrivalsGeofencer
} from "./Geofencing"
import { ArrayUtils } from "@lib/utils/Array"
import { PerformArrivalsOperation } from "./ArrivalsOperation"
import { EventArrival } from "./Models"
import { areEventRegionsEqual } from "@shared-models/Event"

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
  async refreshArrivals (
    fetchUpcomingArrivals: () => Promise<EventArrivalRegion[]>
  ) {
    await this.syncRegions(await fetchUpcomingArrivals())
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
    await this.transformAllUpcomingArrivals((regions) => {
      const eventIds = new Set(newArrivals.map((arrival) => arrival.eventId))
      const newRegions = this.removeByEventIdsTransform(eventIds, regions)
      for (const arrival of newArrivals) {
        const regionIndex = newRegions.findIndex((region) => {
          return areEventRegionsEqual(region, arrival)
        })
        if (regionIndex === -1) {
          newRegions.push({
            eventIds: [arrival.eventId],
            coordinate: arrival.coordinate,
            arrivalRadiusMeters: arrival.arrivalRadiusMeters,
            isArrived: false
          })
        } else {
          newRegions[regionIndex].eventIds.push(arrival.eventId)
        }
      }
      return newRegions
    })
  }

  async removeArrivalByEventId (eventId: number) {
    await this.removeArrivalsByEventIds(new Set([eventId]))
  }

  async removeArrivalsByEventIds (eventIds: Set<number>) {
    await this.transformAllUpcomingArrivals((regions) => {
      return this.removeByEventIdsTransform(eventIds, regions)
    })
  }

  private removeByEventIdsTransform (
    eventIds: Set<number>,
    regions: EventArrivalRegion[]
  ) {
    return ArrayUtils.compactMap(regions, (region) => {
      const newEventIds = region.eventIds.filter((id) => !eventIds.has(id))
      if (newEventIds.length === 0) return undefined
      region.eventIds = newEventIds
      return region
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

  private async transformAllUpcomingArrivals (
    work: (
      regions: EventArrivalRegion[]
    ) => Promise<EventArrivalRegion[]> | EventArrivalRegion[]
  ) {
    await this.syncRegions(await work(await this.upcomingArrivals.all()))
  }

  private async syncRegions (regions: EventArrivalRegion[]) {
    await Promise.all([
      this.geofencer.replaceGeofencedRegions(regions),
      this.upcomingArrivals.replaceAll(regions)
    ])
    this.updateGeofencingSubscription(regions)
  }

  private updateGeofencingSubscription (arrivals: EventArrivalRegion[]) {
    this.stopTracking()
    if (arrivals.length > 0) {
      this.unsubscribeFromGeofencing = this.geofencer.onUpdate((update) => {
        this.handleGeofencingUpdate(update)
      })
    }
  }

  private async handleGeofencingUpdate (update: EventArrivalGeofencedRegion) {
    const upcomingArrivals = await this.performArrivalsOperation(
      update,
      update.isArrived ? "arrived" : "departed"
    )
    await this.syncRegions(upcomingArrivals)
  }
}
