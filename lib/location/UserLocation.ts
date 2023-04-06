import { TrackedLocation } from "./Location"
import {
  watchPositionAsync,
  LocationOptions,
  LocationCallback,
  LocationSubscription,
  LocationAccuracy,
  LocationObject
} from "expo-location"
import { createDependencyKey } from "../dependencies"

/**
 * An accurracy to track the user's location.
 *
 * A higher accurracy may consume more device resources.
 *
 * `approximate-low`: Accurrate within 1km.
 * `approximate-medium`: Accurate within 100m.
 * `precise`: The most precise accurracy possible.
 */
export type UserLocationTrackingAccurracy =
  | "approximate-low"
  | "approximate-medium"
  | "precise"

const accurracyToExpoAccurracy = (accurracy: UserLocationTrackingAccurracy) => {
  if (accurracy === "approximate-low") return LocationAccuracy.Low
  if (accurracy === "approximate-medium") return LocationAccuracy.Balanced
  return LocationAccuracy.Highest
}

/**
 * An update published to a (@link TrackUserLocation} callback.
 */
export type UserLocationTrackingUpdate =
  | { status: "error" }
  | { status: "success"; location: TrackedLocation }

export type StopUserLocationTracking = () => void

/**
 * A function type to track a user's location.
 *
 * @param accurracy The accurracy of which to track the user's location.
 * @param callback Handles an {@link UserLocationTrackingUpdate}.
 * @returns A function to stop tracking the user's location.
 */
export type TrackUserLocation = (
  accuracy: UserLocationTrackingAccurracy,
  callback: (update: UserLocationTrackingUpdate) => void
) => StopUserLocationTracking

/**
 * Tracks the user's location using expo.
 */
export const expoTrackUserLocation = (
  accurracy: UserLocationTrackingAccurracy,
  onUpdate: (update: UserLocationTrackingUpdate) => void,
  track: (
    options: LocationOptions,
    callback: LocationCallback
  ) => Promise<LocationSubscription> = watchPositionAsync
) => {
  const subscription = track(
    { accuracy: accurracyToExpoAccurracy(accurracy) },
    (locationObject) => {
      onUpdate({
        status: "success",
        location: expoLocationToTrackedLocation(locationObject)
      })
    }
  )
  subscription.catch(() => onUpdate({ status: "error" }))
  return async () => (await subscription).remove()
}

const expoLocationToTrackedLocation = (location: LocationObject) => ({
  coordinate: {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude
  },
  trackingDate: new Date(location.timestamp / 1000)
})

/**
 * Dependency Keys relating to operations around the user's location.
 */
export namespace UserLocationDependencyKeys {
  /**
   * A dependency key to track the user's location.
   */
  export const track = createDependencyKey<TrackUserLocation>(
    () => expoTrackUserLocation
  )
}
