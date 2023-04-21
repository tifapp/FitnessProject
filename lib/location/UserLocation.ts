import { TrackedLocationCoordinates } from "./Location"
import {
  watchPositionAsync,
  LocationOptions,
  LocationCallback,
  LocationSubscription,
  LocationAccuracy,
  LocationObject
} from "expo-location"

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

/**
 * A function type to query the current user's coordinates.
 */
export type QueryUserCoordinates = (
  accurracy: UserLocationTrackingAccurracy
) => Promise<TrackedLocationCoordinates>

/**
 * An update published to a (@link TrackUserLocation} callback.
 */
export type UserLocationTrackingUpdate =
  | { status: "error" }
  | { status: "success"; location: TrackedLocationCoordinates }

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
  onUpdate: (update: UserLocationTrackingUpdate) => void
) => StopUserLocationTracking

/**
 * Tracks the user's location using expo.
 *
 * @param accurracy The accurracy of which to track the user's location.
 * @param callback Handles an {@link UserLocationTrackingUpdate}.
 * @returns A function to stop tracking the user's location.
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
  return () => subscription.then((sub) => sub.remove())
}

const accurracyToExpoAccurracy = (accurracy: UserLocationTrackingAccurracy) => {
  if (accurracy === "approximate-low") return LocationAccuracy.Low
  if (accurracy === "approximate-medium") return LocationAccuracy.Balanced
  return LocationAccuracy.Highest
}

const expoLocationToTrackedLocation = (location: LocationObject) => ({
  coordinates: {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude
  },
  trackingDate: new Date(location.timestamp / 1000)
})
