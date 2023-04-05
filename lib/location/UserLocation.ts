import { TrackedLocation } from "./Location"
import {
  watchPositionAsync,
  requestForegroundPermissionsAsync,
  getLastKnownPositionAsync,
  getCurrentPositionAsync,
  LocationObject,
  LocationAccuracy
} from "expo-location"
import { createDependencyKey, useDependencyValue } from "../dependencies"
import { useEffect, useRef, useState } from "react"

// Android -> E_LOCATION_UNAUTHORIZED
// iOS (Perms Denied) -> E_NO_PERMISSIONS
// iOS (Services Disabled) -> E_LOCATION_SERVICES_DISABLED
export type UserLocationTrackingAccurracy = "low-accurracy" | "precise-accurracy"

export type UserLocationTrackingError = "no-permissions" | "services-disabled"

export type UserLocationTrackingUpdate =
  { status: "error", error: UserLocationTrackingError }
  | { status: "undetermined" }
  | { status: "success", location: TrackedLocation }

export type StopUserLocationTracking = () => void
export type TrackUserLocation = (
  accuracy: UserLocationTrackingAccurracy,
  callback: (update: UserLocationTrackingUpdate) => void
) => StopUserLocationTracking

export namespace UserLocationDependencyKeys {
  export const track = createDependencyKey<TrackUserLocation>(() => () => { })
}
