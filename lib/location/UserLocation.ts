import { TrackedLocation } from "./Location"
import ExpoLocation from "expo-location"
import { createDependencyKey } from "@lib/dependencies"

export type StopUserLocationTracking = () => void

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
   * @param callback a callback that accepts a `TrackedLocation` and runs whenever an update occurs
   * @returns a function to stop tracking
   */
  track: (
    callback: (location: TrackedLocation) => void
  ) => Promise<StopUserLocationTracking>
}

const expoRequestForegroundPermission = async () => {
  return (await ExpoLocation.requestForegroundPermissionsAsync()).granted
}

const expoLastKnownLocation = async () => {
  const location = await ExpoLocation.getLastKnownPositionAsync()
  return location ? toTrackedLocation(location) : null
}

const expoCurrentLocation = async () => {
  return toTrackedLocation(await ExpoLocation.getCurrentPositionAsync())
}

const expoTrackUserLocation = async (
  callback: (location: TrackedLocation) => void
) => {
  const subscription = await ExpoLocation.watchPositionAsync({}, (location) =>
    callback(toTrackedLocation(location))
  )
  return subscription.remove as StopUserLocationTracking
}

const toTrackedLocation = (locationResponse: ExpoLocation.LocationObject) => {
  return {
    location: locationResponse.coords,
    trackingDate: new Date(locationResponse.timestamp)
  } as TrackedLocation
}

/**
 * `DependencyKey` for `UserLocation` operations.
 */
export const userLocationDependencyKey = createDependencyKey<UserLocation>({
  requestForegroundPermission: expoRequestForegroundPermission,
  lastKnownLocation: expoLastKnownLocation,
  currentLocation: expoCurrentLocation,
  track: expoTrackUserLocation
})
