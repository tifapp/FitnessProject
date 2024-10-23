/* eslint-disable func-call-spacing */
import { LocationSubscription } from "expo-location"
import { EventRegionMonitor } from "./RegionMonitoring"
import {
  RegionState,
  filterStateIfInactive,
  stateForRegion
} from "./RegionState"
import {
  LocationCoordinate2D,
  coordinateDistance
} from "TiFShared/domain-models/LocationCoordinate2D"
import { EventRegion } from "TiFShared/domain-models/Event"

/**
 * A way to monitor the user's proximity to {@link EventRegion}s entirely in
 * the foreground.
 *
 * We can only monitor event regions in the background given 2 conditions:
 * 1. The user has given us access to background location permissions.
 * 2. The user is attending an event in the region of interest within the next
 *    24 hours
 *
 * The second condition is due to OS constraints only allowing up to 20
 * locations on iOS to be monitored, and 100 on android in the background.
 *
 * To get around those conditions, this special {@link EventRegionMonitor}
 * conformance attempts to mimick the background geofencing capabilities, but
 * completely in the foreground. This still allows users to see arrival
 * information on the details screen even if the 2 conditions don't apply.
 *
 * Only 1 subscription is made to watch the current user's location, and it
 * can be controlled via the `startWatchingIfNeeded` and
 * `stopWatchingIfNeeded`. Adding a region to be monitored also starts up the
 * subscription. This laziness ensures that if location permissions change
 * while the app is open, then this class will behave accordingly.
 */
export class ForegroundEventRegionMonitor implements EventRegionMonitor {
  private regionStates = [] as ForegroundRegionState[]

  private userCoordinate?: LocationCoordinate2D
  private watchPromise?: Promise<LocationSubscription>
  private readonly watch: (
    callback: (coordinate: LocationCoordinate2D) => void
  ) => Promise<LocationSubscription>

  constructor(
    watch: (
      callback: (coordinate: LocationCoordinate2D) => void
    ) => Promise<LocationSubscription>
  ) {
    this.watch = watch
  }

  monitorRegion(region: EventRegion, callback: (hasArrived: boolean) => void) {
    const hasArrived = this.hasArrivedAtRegion(region)
    const state = this.findOrPushStateForRegion(region, hasArrived)
    const unsub = state.subscribeEmittingInitialStatus(callback)
    this.startWatchingIfNeeded()
    return async () => {
      unsub()
      this.regionStates = filterStateIfInactive(state, this.regionStates)
      await this.stopWatchingIfNeeded()
    }
  }

  hasArrivedAtRegion(region: EventRegion) {
    const state = stateForRegion(region, this.regionStates)
    if (state) return state.hasArrived
    return isCoordinateWithinRegion(region, this.userCoordinate)
  }

  private findOrPushStateForRegion(region: EventRegion, hasArrived: boolean) {
    const state = stateForRegion(region, this.regionStates)
    const newState = state ?? new ForegroundRegionState(region, hasArrived)
    if (!state) {
      this.regionStates.push(newState)
    }
    return newState
  }

  private handleUserCoordinateUpdate(newCoordinate: LocationCoordinate2D) {
    this.userCoordinate = newCoordinate
    this.regionStates.forEach((state) => {
      const hasArrivedAtNewCoordinate = isCoordinateWithinRegion(
        state.region,
        newCoordinate
      )
      state.publishUpdateIfNeeded(hasArrivedAtNewCoordinate)
    })
  }

  private startWatchingIfNeeded() {
    if (this.watchPromise) return
    this.watchPromise = this.watch((coordinate) => {
      this.handleUserCoordinateUpdate(coordinate)
    })
  }

  private async stopWatchingIfNeeded() {
    if (this.regionStates.length > 0) return
    const subscription = await this.watchPromise
    subscription?.remove()
    this.watchPromise = undefined
  }
}

class ForegroundRegionState extends RegionState {
  subscribeEmittingInitialStatus(callback: (hasArrived: boolean) => void) {
    callback(super.hasArrived)
    return super.subscribe(callback)
  }

  publishUpdateIfNeeded(hasArrived: boolean) {
    const didCrossRegionBoundary = this.hasArrived !== hasArrived
    if (didCrossRegionBoundary) super.publishUpdate(hasArrived)
  }
}

const isCoordinateWithinRegion = (
  region: EventRegion,
  coordinate?: LocationCoordinate2D
) => {
  if (!coordinate) return false
  const metersDiff = coordinateDistance(region.coordinate, coordinate, "meters")
  return metersDiff <= region.arrivalRadiusMeters
}
