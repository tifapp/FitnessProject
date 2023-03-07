import { TrackedLocation } from "./Location"
import ExpoLocation from "expo-location"
import { createDependencyKey } from "../dependencies"

export type StopUserLocationTracking = () => void

/**
 * An accurracy of where the user's location is when tracking.
 *
 * A more precise accuracy may consume more device energy.
 */
export enum UserLocationTrackingAccurracy {
  /**
   * Accurate to the nearest kilometer.
   */
  Low = 1,

  /**
   * Accurate to within one hundred meters.
   */
  Medium = 2,

  /**
   * Accurate to within ten meters of the desired target.
   */
  High = 3,

  /**
   * The best level of accuracy available.
   */
  Precise = 4
}

/**
 * Options for tracking the user's location.
 */
export type UserLocationTrackingOptions = {
  /**
   * The accuracy of the tracked location.
   *
   * A more precise accuracy may consume more device energy.
   *
   * (Default: UserLocationTrackingAccuracy.Medium)
   */
  accuracy?: UserLocationTrackingAccurracy

  /**
   * The minimum number of meters changed to cause an update to be emitted.
   *
   * (Default: Determined by expo)
   */
  minUpdateMetersDistance?: number
}

/**
 * An interface around operations regarding the current user's location.
 */
export interface UserLocation {
  /**
   * Requests foreground permission to track the user's location.
   *
   * @returns `true` if granted.
   */
  requestForegroundPermission: () => Promise<boolean>

  /**
   * Returns the user's last known location if authorized.
   *
   * While this method is faster than `currentLocation`, it may return
   * an outdated location or even `null` since it doesn't attempt to
   * query the user's current location.
   */
  lastKnownLocation: () => Promise<TrackedLocation | null>

  /**
   * Returns the user's current location if authorized.
   */
  currentLocation: () => Promise<TrackedLocation>

  /**
   * Invokes the given callback when the user's location changes.
   *
   * @param options
   * @param callback a callback that accepts a `TrackedLocation` and runs whenever an update occurs
   * @returns a function to stop tracking
   */
  track: (
    callback: (location: TrackedLocation) => void,
    options?: UserLocationTrackingOptions
  ) => Promise<StopUserLocationTracking>
}

/**
 * `UserLocation` operations implemented by expo.
 */
export class ExpoUserLocation implements UserLocation {
  async requestForegroundPermission () {
    return (await ExpoLocation.requestForegroundPermissionsAsync()).granted
  }

  async lastKnownLocation () {
    const location = await ExpoLocation.getLastKnownPositionAsync()
    return location ? toTrackedLocation(location) : null
  }

  async currentLocation () {
    return toTrackedLocation(await ExpoLocation.getCurrentPositionAsync())
  }

  async track (
    callback: (location: TrackedLocation) => void,
    options: UserLocationTrackingOptions = defaultTrackingOptions
  ) {
    const subscription = await ExpoLocation.watchPositionAsync(
      {
        accuracy: toExpoAccurracy(options.accuracy),
        distanceInterval: options.minUpdateMetersDistance
      },
      (location) => callback(toTrackedLocation(location))
    )
    return subscription.remove as StopUserLocationTracking
  }
}

const defaultTrackingOptions: UserLocationTrackingOptions = {
  accuracy: UserLocationTrackingAccurracy.Medium
}

const toExpoAccurracy = (accuracy?: UserLocationTrackingAccurracy) => {
  switch (accuracy) {
  case UserLocationTrackingAccurracy.Low:
    return ExpoLocation.LocationAccuracy.Low
  case UserLocationTrackingAccurracy.High:
    return ExpoLocation.LocationAccuracy.High
  case UserLocationTrackingAccurracy.Precise:
    return ExpoLocation.LocationAccuracy.Highest
  default:
    return ExpoLocation.LocationAccuracy.Balanced
  }
}

const toTrackedLocation = (locationResponse: ExpoLocation.LocationObject) => {
  return {
    coordinate: locationResponse.coords,
    trackingDate: new Date(locationResponse.timestamp)
  } as TrackedLocation
}

/**
 * `DependencyKey` for `UserLocation` operations.
 */
export const userLocationDependencyKey = createDependencyKey<UserLocation>(
  new ExpoUserLocation()
)
