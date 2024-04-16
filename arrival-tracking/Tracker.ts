/* eslint-disable func-call-spacing */
import { EventArrivalsStorage } from "./Storage"
import {
  EventArrivalGeofencedRegion,
  EventArrivalGeofencingUnsubscribe,
  EventArrivalsGeofencer
} from "./geofencing"

import { PerformArrivalsOperation } from "./ArrivalsOperation"
import { CallbackCollection } from "@lib/utils/CallbackCollection"
import { logger } from "TiFShared/logging"
import { EventArrivals } from "./Arrivals"

const log = logger("event.arrivals.tracker")

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
  private readonly storage: EventArrivalsStorage
  private readonly geofencer: EventArrivalsGeofencer
  private readonly performArrivalsOperation: PerformArrivalsOperation

  private unsubscribeFromGeofencing?: EventArrivalGeofencingUnsubscribe
  private callbacks = new CallbackCollection<EventArrivals>()

  constructor(
    storage: EventArrivalsStorage,
    geofencer: EventArrivalsGeofencer,
    performArrivalsOperation: PerformArrivalsOperation
  ) {
    this.storage = storage
    this.geofencer = geofencer
    this.performArrivalsOperation = performArrivalsOperation
  }

  /**
   * Returns an instance of {@link EventArrivals} based on the current arrivals
   * stored in this tracker.
   */
  async trackedArrivals() {
    return await this.storage.current()
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
  async replaceArrivals(arrivals: EventArrivals) {
    try {
      await Promise.all([
        this.geofencer.replaceGeofencedRegions(arrivals.regions),
        this.storage.replace(arrivals)
      ])
      this.updateGeofencingSubscription(arrivals)
      this.callbacks.send(arrivals)
    } catch (e) {
      log.error("Failed to replace regions", { message: e.message })
      this.callbacks.send(new EventArrivals())
    }
  }

  /**
   * Refreshes the upcoming arrivals.
   *
   * @param fetchUpcomingArrivals a function to fetch the upcoming {@link EventArrival}s.
   */
  async refreshArrivals(fetchUpcomingArrivals: () => Promise<EventArrivals>) {
    await this.replaceArrivals(await fetchUpcomingArrivals())
  }

  /**
   * Starts tracking if there is at least 1 upcoming event arrival.
   */
  async startTracking() {
    this.updateGeofencingSubscription(await this.storage.current())
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
    callback: (regions: EventArrivals) => void
  ): EventArrivalsTrackerSubscription {
    const unsubscribe = this.callbacks.add(callback)
    const initial = this.trackedArrivals().then(callback)
    return {
      waitForInitialRegionsToLoad: () => initial,
      unsubscribe
    }
  }

  /**
   * Updates the arrivals in this tracker based on a transformation function
   * on the current {@link EventArrivals} stored in this tracker.
   */
  async transformTrackedArrivals(
    work: (arrivals: EventArrivals) => Promise<EventArrivals> | EventArrivals
  ) {
    await this.replaceArrivals(await work(await this.storage.current()))
  }

  private updateGeofencingSubscription(arrivals: EventArrivals) {
    this.stopTracking()
    if (arrivals.regions.length > 0) {
      this.unsubscribeFromGeofencing = this.geofencer.onUpdate((update) => {
        this.handleGeofencingUpdate(update)
      })
    }
  }

  private async handleGeofencingUpdate(update: EventArrivalGeofencedRegion) {
    const upcomingArrivals = await this.performArrivalsOperation(
      update,
      update.hasArrived ? "arrived" : "departed"
    )
    await this.replaceArrivals(upcomingArrivals)
  }
}
