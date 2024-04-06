/* eslint-disable comma-spacing */
import {
  EventRegionMonitor,
  EventRegionMonitorUnsubscribe
} from "./RegionMonitoring"
import {
  EventArrivalsTracker,
  EventArrivalsTrackerSubscription
} from "../Tracker"
import {
  RegionState,
  filterStateIfInactive,
  stateForRegion
} from "./RegionState"
import {
  EventArrivalRegion,
  EventRegion,
  areEventRegionsEqual
} from "TiFShared/domain-models/Event"

/**
 * An {@link EventRegionMonitor} that subscribes to updates for regions in the
 * {@link EventArrivalsTracker}, and monitors all other regions using a fallback
 * {@link EventRegionMonitor}.
 *
 * When a region is added or removed from the tracker whilst being monitored
 * it is seamlessly migrated to be monitored by tracker subscriptions if added,
 * or by the fallback subscription if removed.
 *
 * When performing such a migration, the latest update from both of the
 * monitoring sources is emitted if it is not a duplicate of the last emitted
 * update. For example, when a region being monitored by tracker subscriptions
 * receives an update from the fallback subscription, then once that region is
 * removed from {@link EventArrivalsTracker} it immediately emits the previous
 * update from the fallback subscription. However, any "buffered updates" from
 * the fallback subscription are invalidated once the tracker subscription
 * publishes. In the context of the previous example, if the tracker
 * subscription published another update after the fallback subscription
 * update, then the buffered update from the fallback is removed and no
 * immediate update is performed when switching the subscription.
 *
 * The initial value of a subscription isn't published until
 * {@link EventArrivalsTracker} has published its first update containing all
 * currently tracked regions.
 */
export class EventArrivalsTrackerRegionMonitor implements EventRegionMonitor {
  private readonly tracker: EventArrivalsTracker
  private readonly fallbackMonitor: EventRegionMonitor
  private regionStates = [] as EventArrivalsTrackerMonitorRegionState[]
  private trackerSubscription?: EventArrivalsTrackerSubscription

  constructor(
    tracker: EventArrivalsTracker,
    fallbackMonitor: EventRegionMonitor
  ) {
    this.tracker = tracker
    this.fallbackMonitor = fallbackMonitor
  }

  monitorRegion(region: EventRegion, callback: (hasArrived: boolean) => void) {
    const state = this.findOrPushStateForRegion(region)
    const unsub = state.subscribeWithFallbackMonitoring(
      callback,
      this.fallbackMonitor,
      this.subscribeToTrackerIfNeeded()
    )
    return async () => {
      await unsub()
      this.regionStates = filterStateIfInactive(state, this.regionStates)
      this.unsubscribeFromTrackerIfNeeded()
    }
  }

  hasArrivedAtRegion(region: EventRegion) {
    const state = stateForRegion(region, this.regionStates)
    if (state) return state.hasArrived
    return this.fallbackMonitor.hasArrivedAtRegion(region)
  }

  private findOrPushStateForRegion(region: EventRegion) {
    const currentState = stateForRegion(region, this.regionStates)
    const state =
      currentState ?? new EventArrivalsTrackerMonitorRegionState(region, false)
    if (!currentState) {
      this.regionStates.push(state)
    }
    return state
  }

  private unsubscribeFromTrackerIfNeeded() {
    if (this.regionStates.length === 0) return
    this.trackerSubscription?.unsubscribe()
    this.trackerSubscription = undefined
  }

  private subscribeToTrackerIfNeeded() {
    if (this.trackerSubscription) {
      return this.trackerSubscription
    }
    const trackerSubscription = this.tracker.subscribe((regions) => {
      this.publishPossibleRegionUpdates(regions)
    })
    this.trackerSubscription = trackerSubscription
    return trackerSubscription
  }

  private publishPossibleRegionUpdates(regions: EventArrivalRegion[]) {
    for (const state of this.regionStates) {
      const region = regions.find((region) => {
        return areEventRegionsEqual(state.region, region)
      })
      state.publishRegionChangeIfNeeded(region)
    }
    for (const region of regions) {
      const hasState = !!stateForRegion(region, this.regionStates)
      if (!hasState) {
        const state = new EventArrivalsTrackerMonitorRegionState(
          region,
          region.hasArrived,
          true
        )
        this.regionStates.push(state)
      }
    }
  }
}

class EventArrivalsTrackerMonitorRegionState extends RegionState {
  private isBeingTrackedByArrivalsTracker: boolean
  private bufferedFallbackHasArrived?: boolean
  private foregroundMonitorUnsubscribe?: EventRegionMonitorUnsubscribe

  override get isActive() {
    return this.isBeingTrackedByArrivalsTracker || super.hasSubscribers
  }

  constructor(
    region: EventRegion,
    hasArrived: boolean,
    isBeingTrackedByArrivalsTracker: boolean = false
  ) {
    super(region, hasArrived)
    this.isBeingTrackedByArrivalsTracker = isBeingTrackedByArrivalsTracker
  }

  subscribeWithFallbackMonitoring(
    callback: (hasArrived: boolean) => void,
    fallbackMonitor: EventRegionMonitor,
    trackerSubscription: EventArrivalsTrackerSubscription
  ) {
    const promise = trackerSubscription
      .waitForInitialRegionsToLoad()
      .then(() => {
        if (this.isBeingTrackedByArrivalsTracker) {
          callback(super.hasArrived)
        } else {
          callback(fallbackMonitor.hasArrivedAtRegion(this.region))
        }
        const baseUnsub = super.subscribe(callback)
        this.subscribeToFallbackMonitorIfNeeded(fallbackMonitor)
        return baseUnsub
      })
    return async () => {
      const unsub = await promise
      unsub()
      this.unsubscribeFromForegroundMonitorIfNeeded()
    }
  }

  private subscribeToFallbackMonitorIfNeeded(monitor: EventRegionMonitor) {
    if (this.foregroundMonitorUnsubscribe) return
    this.foregroundMonitorUnsubscribe = monitor.monitorRegion(
      this.region,
      (hasArrived) => {
        if (!this.isBeingTrackedByArrivalsTracker) {
          super.publishUpdate(hasArrived)
        } else {
          this.bufferedFallbackHasArrived = hasArrived
        }
      }
    )
  }

  private unsubscribeFromForegroundMonitorIfNeeded() {
    if (super.hasSubscribers) return
    this.foregroundMonitorUnsubscribe?.()
    this.foregroundMonitorUnsubscribe = undefined
  }

  publishRegionChangeIfNeeded(region: EventArrivalRegion | undefined) {
    this.isBeingTrackedByArrivalsTracker = !!region
    if (region) {
      this.publishUpdateIfNotDuplicate(region.hasArrived)
    } else if (!region && this.bufferedFallbackHasArrived) {
      this.publishUpdateIfNotDuplicate(this.bufferedFallbackHasArrived)
      this.bufferedFallbackHasArrived = undefined
    }
  }

  private publishUpdateIfNotDuplicate(hasArrived: boolean) {
    if (super.hasArrived === hasArrived) return
    super.publishUpdate(hasArrived)
    this.bufferedFallbackHasArrived = undefined
  }
}
