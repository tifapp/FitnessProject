/* eslint-disable func-call-spacing */
import { UpcomingEventArrivals } from "./UpcomingArrivals"
import { EventArrivalRegion } from "@shared-models/EventArrivals"
import {
  EventArrivalGeofencedRegion,
  EventArrivalGeofencingUnsubscribe,
  EventArrivalsGeofencer
} from "./geofencing"

import { PerformArrivalsOperation } from "./ArrivalsOperation"
import { EventArrival, arrivalRegion, removeDuplicateArrivals } from "./Models"
import { CallbackCollection } from "@lib/CallbackCollection"
import { createLogFunction } from "@lib/Logging"
import { areEventRegionsEqual } from "TiFShared/domain-models/Event"

const log = createLogFunction("event.arrivals.tracker")

export interface EventArrivalsTrackerSubscription {
  waitForInitialRegionsToLoad(): Promise<void>
  unsubscribe(): void
}

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
  private callbacks = new CallbackCollection<EventArrivalRegion[]>()

  constructor(
    upcomingArrivals: UpcomingEventArrivals,
    geofencer: EventArrivalsGeofencer,
    performArrivalsOperation: PerformArrivalsOperation
  ) {
    this.upcomingArrivals = upcomingArrivals
    this.geofencer = geofencer
    this.performArrivalsOperation = performArrivalsOperation
  }

  /**
   * Replaces all existing {@link EventArrivalRegion}s held by this tracker.
   *
   * If this method throws, then all events are removed from the tracker, and
   * an empty array of {@link EventArrivalRegion}s is published to all
   * subscribers. We remove all regions because the act of throwing means that
   * no region is being geofenced properly, likely due to background location
   * permissions being disabled.
   */
  async replaceRegions(regions: EventArrivalRegion[]) {
    try {
      await Promise.all([
        this.geofencer.replaceGeofencedRegions(regions),
        this.upcomingArrivals.replaceAll(regions)
      ])
      this.updateGeofencingSubscription(regions)
      this.callbacks.send(regions)
    } catch (e) {
      log("error", "Failed to replace regions", { message: e.message })
      this.callbacks.send([])
    }
  }

  /**
   * Refreshes the upcoming arrivals.
   *
   * @param fetchUpcomingArrivals a function to fetch the upcoming {@link EventArrival}s.
   */
  async refreshArrivals(
    fetchUpcomingArrivals: () => Promise<EventArrivalRegion[]>
  ) {
    await this.replaceRegions(await fetchUpcomingArrivals())
  }

  /**
   * Adds an {@link EventArrival} to tracking.
   *
   * If an arrival exists with the same event id, then that arrival is updated instead of added.
   */
  async trackArrival(newArrival: EventArrival) {
    await this.trackArrivals([newArrival])
  }

  async trackArrivals(newArrivals: EventArrival[]) {
    await this.transformAllUpcomingArrivals((regions) => {
      const deduplicatedArrivals = removeDuplicateArrivals(newArrivals)
      const newRegions = this.removeByEventIdsTransform(
        new Set(deduplicatedArrivals.map((arrival) => arrival.eventId)),
        regions
      )
      for (const arrival of deduplicatedArrivals) {
        const regionIndex = newRegions.findIndex((region) => {
          return areEventRegionsEqual(region, arrival)
        })
        if (regionIndex === -1) {
          newRegions.push(arrivalRegion(arrival))
        } else {
          newRegions[regionIndex].eventIds.push(arrival.eventId)
        }
      }
      return newRegions
    })
  }

  async removeArrivalByEventId(eventId: number) {
    await this.removeArrivalsByEventIds(new Set([eventId]))
  }

  async removeArrivalsByEventIds(eventIds: Set<number>) {
    await this.transformAllUpcomingArrivals((regions) => {
      return this.removeByEventIdsTransform(eventIds, regions)
    })
  }

  private removeByEventIdsTransform(
    eventIds: Set<number>,
    regions: EventArrivalRegion[]
  ) {
    return regions.ext.compactMap((region) => {
      const newEventIds = region.eventIds.filter((id) => !eventIds.has(id))
      if (newEventIds.length === 0) return undefined
      region.eventIds = newEventIds
      return region
    })
  }

  /**
   * Starts tracking if there is at least 1 upcoming event arrival.
   */
  async startTracking() {
    const arrivals = await this.upcomingArrivals.all()
    this.updateGeofencingSubscription(arrivals)
  }

  /**
   * Stops tracking all event arrivals in real-time. This will keep upcoming arrivals
   * persisted, but it will not perform any arrival operations on them.
   */
  stopTracking() {
    this.unsubscribeFromGeofencing?.()
    this.unsubscribeFromGeofencing = undefined
  }

  /**
   * Subscribes to changes in the tracked regions.
   */
  subscribe(
    callback: (regions: EventArrivalRegion[]) => void
  ): EventArrivalsTrackerSubscription {
    const unsubscribe = this.callbacks.add(callback)
    const initial = this.upcomingArrivals.all().then(callback)
    return {
      waitForInitialRegionsToLoad: () => initial,
      unsubscribe
    }
  }

  private async transformAllUpcomingArrivals(
    work: (
      regions: EventArrivalRegion[]
    ) => Promise<EventArrivalRegion[]> | EventArrivalRegion[]
  ) {
    await this.replaceRegions(await work(await this.upcomingArrivals.all()))
  }

  private updateGeofencingSubscription(arrivals: EventArrivalRegion[]) {
    this.stopTracking()
    if (arrivals.length > 0) {
      this.unsubscribeFromGeofencing = this.geofencer.onUpdate((update) => {
        this.handleGeofencingUpdate(update)
      })
    }
  }

  private async handleGeofencingUpdate(update: EventArrivalGeofencedRegion) {
    const upcomingArrivals = await this.performArrivalsOperation(
      update,
      update.isArrived ? "arrived" : "departed"
    )
    await this.replaceRegions(upcomingArrivals)
  }
}
