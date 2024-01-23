/* eslint-disable func-call-spacing */
import { uuidString } from "@lib/utils/UUID"
import { EventRegion, areEventRegionsEqual } from "@shared-models/Event"
import {
  LocationCoordinate2D,
  metersBetweenLocations
} from "@shared-models/Location"
import { LocationSubscription } from "expo-location"
import { EventRegionMonitor } from "./RegionMonitoring"

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
  static BUFFER_TIME = 20_000

  private regionStates = [] as RegionState[]

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
    callback(hasArrived)
    this.startWatchingIfNeeded()
    const state = this.stateForRegion(region)
    const newState = state ?? new RegionState(region, hasArrived)
    if (!state) {
      this.regionStates.push(newState)
    }
    const unsub = newState.addCallback(callback)
    return () => {
      unsub()
      if (newState.hasSubscribers) return
      this.regionStates = this.regionStates.filter((state) => {
        return !areEventRegionsEqual(state.region, newState.region)
      })
    }
  }

  hasArrivedAtRegion (region: EventRegion) {
    const state = this.stateForRegion(region)
    if (state) return state.hasArrived
    return isCoordinateWithinRegion(region, this.userCoordinate)
  }

  private handleUserCoordinateUpdate (newCoordinate: LocationCoordinate2D) {
    this.userCoordinate = newCoordinate
    for (const state of this.regionStates) {
      state.processUpdate(newCoordinate)
    }
  }

  private stateForRegion (region: EventRegion) {
    return this.regionStates.find((state) => {
      return areEventRegionsEqual(region, state.region)
    })
  }

  startWatchingIfNeeded () {
    if (this.watchPromise) return
    this.watchPromise = this.watch((coordinate) => {
      this.handleUserCoordinateUpdate(coordinate)
    })
  }

  stopWatchingIfNeeded () {
    this.watchPromise?.then((subscription) => subscription.remove())
    this.watchPromise = undefined
  }
}

class RegionState {
  region: EventRegion
  hasArrived: boolean
  private bufferedUpdate?: {
    timeout: NodeJS.Timeout
    hasArrived: boolean
  }

  private callbacks = new Map<string, (hasArrived: boolean) => void>()

  get hasSubscribers () {
    return this.callbacks.size > 0
  }

  constructor (region: EventRegion, hasArrived: boolean) {
    this.region = region
    this.hasArrived = hasArrived
  }

  addCallback (callback: (hasArrived: boolean) => void) {
    const id = uuidString()
    this.callbacks.set(id, callback)
    return () => this.callbacks.delete(id)
  }

  processUpdate (newCoordinate: LocationCoordinate2D) {
    const hasArrivedAtNewCoordinate = isCoordinateWithinRegion(
      this.region,
      newCoordinate
    )
    const isBufferedUpdateInvalid =
      this.bufferedUpdate?.hasArrived !== hasArrivedAtNewCoordinate
    const didCrossRegionBoundary = this.hasArrived !== hasArrivedAtNewCoordinate
    if (this.bufferedUpdate && isBufferedUpdateInvalid) {
      clearTimeout(this.bufferedUpdate.timeout)
      this.bufferedUpdate = undefined
    } else if (!this.bufferedUpdate && didCrossRegionBoundary) {
      this.bufferedUpdate = {
        timeout: setTimeout(() => {
          this.callbacks.forEach((callback) => {
            callback(hasArrivedAtNewCoordinate)
          })
          this.bufferedUpdate = undefined
          this.hasArrived = hasArrivedAtNewCoordinate
        }, ForegroundEventRegionMonitor.BUFFER_TIME),
        hasArrived: hasArrivedAtNewCoordinate
      }
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
