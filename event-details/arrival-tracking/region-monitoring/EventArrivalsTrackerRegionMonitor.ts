/* eslint-disable comma-spacing */
import { EventRegion, areEventRegionsEqual } from "@shared-models/Event"
import {
  EventRegionMonitor,
  EventRegionMonitorUnsubscribe
} from "./RegionMonitoring"
import {
  EventArrivalsTracker,
  EventArrivalsTrackerUnsubscribe
} from "../Tracker"
import { BaseRegionState, stateForRegion } from "./RegionState"
import { EventArrivalRegion } from "@shared-models/EventArrivals"

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
  private readonly foregroundMonitor: EventRegionMonitor
  private regionStates = [] as EventArrivalsTrackerMonitorRegionState[]
  private didReceiveInitialRegionsPromise?: Promise<void>
  private trackerUnsubscribe?: EventArrivalsTrackerUnsubscribe

  constructor (
    tracker: EventArrivalsTracker,
    foregroundMonitor: EventRegionMonitor
  ) {
    this.tracker = tracker
    this.foregroundMonitor = foregroundMonitor
  }

  monitorRegion (region: EventRegion, callback: (hasArrived: boolean) => void) {
    const currentState = stateForRegion(region, this.regionStates)
    const state =
      currentState ?? new EventArrivalsTrackerMonitorRegionState(region, false)
    if (!currentState) {
      this.regionStates.push(state)
    }
    const didLoadInitialRegionsFromTracker = this.subscribeToTrackerIfNeeded()
    didLoadInitialRegionsFromTracker.then(() => {
      if (state.isBeingTrackedByArrivalsTracker) {
        callback(state.hasArrived)
      } else {
        callback(this.foregroundMonitor.hasArrivedAtRegion(region))
      }
    })
    const unsub = state.subscribeWithForegroundMonitoring(
      callback,
      (region, callback) => {
        return this.foregroundMonitor.monitorRegion(
          region,
          async (hasArrived) => {
            await didLoadInitialRegionsFromTracker
            callback(hasArrived)
          }
        )
      }
    )
    return () => {
      unsub()
      if (!state.hasSubscribers && !state.isBeingTrackedByArrivalsTracker) {
        this.regionStates.filter((regionState) => {
          return !areEventRegionsEqual(regionState.region, state.region)
        })
      }
      if (this.regionStates.length === 0) {
        this.unsubscribeFromTracker()
      }
    }
  }

  hasArrivedAtRegion (region: EventRegion) {
    const state = stateForRegion(region, this.regionStates)
    if (state) return state.hasArrived
    return this.foregroundMonitor.hasArrivedAtRegion(region)
  }

  private unsubscribeFromTracker () {
    this.trackerUnsubscribe?.()
    this.didReceiveInitialRegionsPromise = undefined
    this.trackerUnsubscribe = undefined
  }

  private subscribeToTrackerIfNeeded () {
    if (this.didReceiveInitialRegionsPromise) {
      return this.didReceiveInitialRegionsPromise
    }
    const promise = new Promise<void>((resolve) => {
      this.trackerUnsubscribe = this.tracker.subscribe((regions) => {
        this.updateWithArrivalRegions(regions)
        // NB: When a promise is resolved multiple times, only the first
        // resolve is returned when awaited. Therefore, it's fine to resolve
        // on every subscription.
        resolve()
      })
    })
    this.didReceiveInitialRegionsPromise = promise
    return promise
  }

  private updateWithArrivalRegions (regions: EventArrivalRegion[]) {
    for (const state of this.regionStates) {
      const region = regions.find((region) => {
        return areEventRegionsEqual(state.region, region)
      })
      state.updateWithRegion(region)
    }
    for (const region of regions) {
      const hasState = !!stateForRegion(region, this.regionStates)
      if (!hasState) {
        const state = new EventArrivalsTrackerMonitorRegionState(
          region,
          region.isArrived,
          true
        )
        this.regionStates.push(state)
      }
    }
  }
}

class EventArrivalsTrackerMonitorRegionState extends BaseRegionState {
  private _isBeingTrackedByArrivalsTracker: boolean
  private sinceLastTrackerUpdateHasArrived?: boolean
  private foregroundMonitorUnsubscribe?: EventRegionMonitorUnsubscribe

  get isBeingTrackedByArrivalsTracker () {
    return this._isBeingTrackedByArrivalsTracker
  }

  constructor (
    region: EventRegion,
    hasArrived: boolean,
    isBeingTrackedByArrivalsTracker: boolean = false
  ) {
    super(region, hasArrived)
    this._isBeingTrackedByArrivalsTracker = isBeingTrackedByArrivalsTracker
  }

  subscribeWithForegroundMonitoring (
    callback: (hasArrived: boolean) => void,
    subscribeToForegroundMonitor: (
      region: EventRegion,
      callback: (hasArrived: boolean) => void
    ) => EventRegionMonitorUnsubscribe
  ) {
    const baseUnsub = super.subscribe(callback)
    this.subscribeToForegroundMonitorIfNeeded(subscribeToForegroundMonitor)
    return () => {
      baseUnsub()
      if (!this.hasSubscribers) {
        this.unsubscribeFromForegroundMonitor()
      }
    }
  }

  private subscribeToForegroundMonitorIfNeeded (
    subscribeToForegroundMonitor: (
      region: EventRegion,
      callback: (hasArrived: boolean) => void
    ) => EventRegionMonitorUnsubscribe
  ) {
    if (!this.foregroundMonitorUnsubscribe) {
      this.foregroundMonitorUnsubscribe = subscribeToForegroundMonitor(
        this.region,
        (hasArrived) => {
          if (!this.isBeingTrackedByArrivalsTracker) {
            this.publishUpdate(hasArrived)
          } else {
            this.sinceLastTrackerUpdateHasArrived = hasArrived
          }
        }
      )
    }
  }

  private unsubscribeFromForegroundMonitor () {
    this.foregroundMonitorUnsubscribe?.()
    this.foregroundMonitorUnsubscribe = undefined
  }

  updateWithRegion (region: EventArrivalRegion | undefined) {
    this._isBeingTrackedByArrivalsTracker = !!region
    if (region) {
      this.publishUpdateIfNotDuplicate(region.isArrived)
    } else if (!region && this.sinceLastTrackerUpdateHasArrived) {
      this.publishUpdateIfNotDuplicate(this.sinceLastTrackerUpdateHasArrived)
      this.sinceLastTrackerUpdateHasArrived = undefined
    }
  }

  private publishUpdateIfNotDuplicate (hasArrived: boolean) {
    if (this.hasArrived === hasArrived) return
    this.publishUpdate(hasArrived)
    this.sinceLastTrackerUpdateHasArrived = undefined
  }
}
