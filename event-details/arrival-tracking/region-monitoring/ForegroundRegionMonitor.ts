/* eslint-disable func-call-spacing */
import { EventRegion } from "@shared-models/Event"
import {
  LocationCoordinate2D,
  metersBetweenLocations
} from "@shared-models/Location"
import { LocationSubscription } from "expo-location"
import { EventRegionMonitor } from "./RegionMonitoring"
import {
  RegionState,
  filterStateIfInactive,
  stateForRegion
} from "./RegionState"

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
 * When a user enters or exits a region, the update isn't published
 * immediately. There's a 20 seond buffer between the user crossing a region
 * boundary, and when an update is published. This ensures that the UI isn't
 * spammed with extraneous updates, and it evokes similar behavior as the
 * OS geofencing capabilities.
 *
 * Only 1 subscription is made to watch the current user's location, and it
 * can be controlled via the `startWatchingIfNeeded` and
 * `stopWatchingIfNeeded`. Adding a region to be monitored also starts up the
 * subscription. This laziness ensures that if location permissions change
 * while the app is open, then this class will behave accordingly.
 */
export class ForegroundEventRegionMonitor implements EventRegionMonitor {
  static readonly BUFFER_TIME = 20_000

  private regionStates = [] as ForegroundRegionState[]

  private userCoordinate?: LocationCoordinate2D
  private watchPromise?: Promise<LocationSubscription>
  private readonly watch: (
    callback: (coordinate: LocationCoordinate2D) => void
  ) => Promise<LocationSubscription>

  constructor (
    watch: (
      callback: (coordinate: LocationCoordinate2D) => void
    ) => Promise<LocationSubscription>
  ) {
    this.watch = watch
  }

  monitorRegion (region: EventRegion, callback: (hasArrived: boolean) => void) {
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

  hasArrivedAtRegion (region: EventRegion) {
    const state = stateForRegion(region, this.regionStates)
    if (state) return state.hasArrived
    return isCoordinateWithinRegion(region, this.userCoordinate)
  }

  private findOrPushStateForRegion (region: EventRegion, hasArrived: boolean) {
    const state = stateForRegion(region, this.regionStates)
    const newState = state ?? new ForegroundRegionState(region, hasArrived)
    if (!state) {
      this.regionStates.push(newState)
    }
    return newState
  }

  private handleUserCoordinateUpdate (newCoordinate: LocationCoordinate2D) {
    this.userCoordinate = newCoordinate
    this.regionStates.forEach((state) => {
      const hasArrivedAtNewCoordinate = isCoordinateWithinRegion(
        state.region,
        newCoordinate
      )
      state.scheduleUpdateIfNeeded(
        hasArrivedAtNewCoordinate,
        ForegroundEventRegionMonitor.BUFFER_TIME
      )
    })
  }

  private startWatchingIfNeeded () {
    if (this.watchPromise) return
    this.watchPromise = this.watch((coordinate) => {
      this.handleUserCoordinateUpdate(coordinate)
    })
  }

  private async stopWatchingIfNeeded () {
    if (this.regionStates.length > 0) return
    const subscription = await this.watchPromise
    subscription?.remove()
    this.watchPromise = undefined
  }
}

class ForegroundRegionState extends RegionState {
  private scheduledUpdate?: {
    timeout: NodeJS.Timeout
    hasArrived: boolean
  }

  subscribeEmittingInitialStatus (callback: (hasArrived: boolean) => void) {
    callback(this.hasArrived)
    const baseUnsub = super.subscribe(callback)
    return () => {
      baseUnsub()
      if (!this.hasSubscribers) {
        this.cancelScheduledUpdate()
      }
    }
  }

  scheduleUpdateIfNeeded (hasArrived: boolean, timeout: number) {
    const isScheduledUpdateInvalid =
      this.scheduledUpdate?.hasArrived !== hasArrived
    if (isScheduledUpdateInvalid) {
      this.cancelScheduledUpdate()
    }

    const didCrossRegionBoundary = this.hasArrived !== hasArrived
    if (!this.scheduledUpdate && didCrossRegionBoundary) {
      this.scheduleUpdate(hasArrived, timeout)
    }
  }

  private cancelScheduledUpdate () {
    if (!this.scheduledUpdate) return
    clearTimeout(this.scheduledUpdate.timeout)
    this.scheduledUpdate = undefined
  }

  private scheduleUpdate (hasArrived: boolean, timeout: number) {
    this.scheduledUpdate = {
      timeout: setTimeout(() => {
        this.publishUpdate(hasArrived)
        this.scheduledUpdate = undefined
      }, timeout),
      hasArrived
    }
  }
}

const isCoordinateWithinRegion = (
  region: EventRegion,
  coordinate?: LocationCoordinate2D
) => {
  if (!coordinate) return false
  const metersDiff = metersBetweenLocations(region.coordinate, coordinate)
  return metersDiff <= region.arrivalRadiusMeters
}
