import { TrackedLocation } from "./Location"
import {
  watchPositionAsync,
  LocationOptions,
  LocationCallback,
  LocationSubscription,
  LocationAccuracy
} from "expo-location"
import { createDependencyKey } from "../dependencies"

// Android -> E_LOCATION_UNAUTHORIZED
// iOS (Perms Denied) -> E_NO_PERMISSIONS
// iOS (Services Disabled) -> E_LOCATION_SERVICES_DISABLED

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
 * An error that can occur when tracking a user's location.
 */
export type UserLocationTrackingError =
  | "no-permissions"
  | "services-disabled"
  | "location-unavailable"

/**
 * An update published to a (@link TrackUserLocation} callback.
 */
export type UserLocationTrackingUpdate =
  | { status: "error"; error: UserLocationTrackingError }
  | { status: "undetermined" }
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

export const expoTrackUserLocation = (
  accurracy: UserLocationTrackingAccurracy,
  track: (
    options: LocationOptions,
    callback: LocationCallback
  ) => Promise<LocationSubscription> = watchPositionAsync
) => {
  track({ accuracy: accurracyToExpoAccurracy(accurracy) })
}

/**
   Dependency Keys relating to operations around the user's location.
 */
export namespace UserLocationDependencyKeys {
  /**
   * A dependency key to track the user's location.
   */
  export const track = createDependencyKey<TrackUserLocation>(() => () => {
    /* TODO */
  })
}
