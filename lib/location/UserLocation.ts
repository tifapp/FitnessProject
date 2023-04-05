import { TrackedLocation } from "./Location"
import { createDependencyKey } from "../dependencies"

// Android -> E_LOCATION_UNAUTHORIZED
// iOS (Perms Denied) -> E_NO_PERMISSIONS
// iOS (Services Disabled) -> E_LOCATION_SERVICES_DISABLED

/**
 * An accurracy to track the user's location.
 *
 * A higher accurracy may consume more device resources.
 *
 * `low-accurracy`: Accurrate within 1km.
 * `precise-accurracy`: The most precise accurracy possible.
 */
export type UserLocationTrackingAccurracy = "low-accurracy" | "precise-accurracy"

/**
 * An error that can occur when tracking a user's location.
 */
export type UserLocationTrackingError = "no-permissions" | "services-disabled" | "location-unavailable"

/**
 * An update published by to a (@link TrackUserLocation} callback.
 */
export type UserLocationTrackingUpdate =
  { status: "error", error: UserLocationTrackingError }
  | { status: "undetermined" }
  | { status: "success", location: TrackedLocation }

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
 * Dependency Keys relating to operations around the user's location.
 */
export namespace UserLocationDependencyKeys {
  /**
   * A dependency key to track the user's location.
   */
  export const track = createDependencyKey<TrackUserLocation>(() => () => { /* TODO */ })
}
