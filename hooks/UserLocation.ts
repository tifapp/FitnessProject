import { createDependencyKey, useDependencyValue } from "@lib/dependencies"
import {
  QueryUserCoordinates,
  TrackUserLocation,
  UserLocationTrackingAccurracy,
  UserLocationTrackingUpdate,
  expoTrackUserLocation
} from "@lib/location/UserLocation"
import { requestForegroundPermissionsAsync } from "expo-location"
import { useEffect, useState } from "react"
import { useQuery } from "react-query"

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

  /**
   * A dependency key to load the user's current coordinates a single time.
   */
  // TODO: - Live Value
  export const currentCoordinates = createDependencyKey<QueryUserCoordinates>()
}

/**
 * A hook to observe the user's current location using the
 * `UserLocationDependencyKeys.track` dependency.
 *
 * **Notice**:
 * This hook will always return an error update if the user previously
 * denied location permissions but then allowed them in settings.
 * To fix this, ensure you re-request the location permissions before calling
 * this hook.
 *
 * @param accurracy See {@link UserLocationTrackingAccurracy}, defaults to `approximate-low`.
 */
export const useTrackUserLocation = (
  accurracy: UserLocationTrackingAccurracy = "approximate-low"
) => {
  const trackLocation = useDependencyValue(UserLocationDependencyKeys.track)
  const [location, setLocation] = useState<
    UserLocationTrackingUpdate | undefined
  >()

  useEffect(
    () => trackLocation(accurracy, setLocation),
    [trackLocation, accurracy]
  )

  return location
}

/**
 * Request the permissions of the user.
 *
 * @returns A boolean indicating  whether or not it worked.
 *
 */

export const requestLocationPermissions = async () => {
  const { status } = await requestForegroundPermissionsAsync()
  if (status == "granted") {
    return true
  } else return false
}

/**
 * Loads the current user's coordinates using the
 * `UserLocationDependencyKeys.currentCoordinates` dependency key.
 *
 * **Notice**:
 * This hook will always return an error status if the user previously
 * denied location permissions but then allowed them in settings.
 * To fix this, ensure you re-request the location permissions before calling
 * this hook.
 *
 * @param accurracy See {@link UserLocationTrackingAccurracy}, defaults to `approximate-low`.
 */
export const useUserCoordinatesQuery = (
  accurracy: UserLocationTrackingAccurracy = "approximate-low"
) => {
  const query = useDependencyValue(
    UserLocationDependencyKeys.currentCoordinates
  )
  return useQuery(
    ["user-coordinates", accurracy],
    async () => await query(accurracy)
  )
}
