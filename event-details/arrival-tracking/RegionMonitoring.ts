/* eslint-disable func-call-spacing */
import { uuidString } from "@lib/utils/UUID"
import { EventRegion, areEventRegionsEqual } from "@shared-models/Event"
import {
  LocationCoordinate2D,
  metersBetweenLocations
} from "@shared-models/Location"
import { LocationSubscription } from "expo-location"
import { useSyncExternalStore } from "react"

export type EventRegionMonitorUnsubscribe = () => void

export interface EventRegionMonitor {
  monitorRegion(
    region: EventRegion,
    callback: (hasArrived: boolean) => void
  ): EventRegionMonitorUnsubscribe

  hasArrivedAtRegion(region: EventRegion): boolean
}

export const useHasArrivedAtRegion = (
  region: EventRegion,
  monitor: EventRegionMonitor
) => {
  return useSyncExternalStore(
    (callback) => monitor.monitorRegion(region, callback),
    () => monitor.hasArrivedAtRegion(region)
  )
}

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
    return isRegionWithinCoordinate(region, this.userCoordinate)
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
    const hasArrivedAtNewCoordinate = isRegionWithinCoordinate(
      this.region,
      newCoordinate
    )
    if (
      this.bufferedUpdate &&
      this.bufferedUpdate.hasArrived !== hasArrivedAtNewCoordinate
    ) {
      clearTimeout(this.bufferedUpdate.timeout)
      this.bufferedUpdate = undefined
    } else if (
      !this.bufferedUpdate &&
      this.hasArrived !== hasArrivedAtNewCoordinate
    ) {
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

const isRegionWithinCoordinate = (
  region: EventRegion,
  coordinate?: LocationCoordinate2D
) => {
  if (!coordinate) return false
  const metersDiff = metersBetweenLocations(region.coordinate, coordinate)
  return metersDiff <= region.arrivalRadiusMeters
}
