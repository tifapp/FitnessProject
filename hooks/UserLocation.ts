import { createDependencyKey, useDependencyValue } from "@lib/dependencies"
import {
  QueryUserCoordinates,
  TrackUserLocation,
  UserLocationTrackingAccurracy,
  UserLocationTrackingUpdate,
  expoQueryUserCoordinates,
  expoTrackUserLocation,
  requestLocationPermissions
} from "@lib/location/UserLocation"
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
  export const currentCoordinates = createDependencyKey<QueryUserCoordinates>(
    () => expoQueryUserCoordinates
  )

  export const requestForegroundPermissions = createDependencyKey(
    () => requestLocationPermissions
  )
}

/**
 * A hook to observe the user's current location using the
 * `UserLocationDependencyKeys.track` dependency.
 *
 * ```tsx
 * const Component = () => {
 *  const userLocation = useTrackUserLocation("precise")
 *  if (!userLocation) return <Text>Location is loading</Text>
 *
 *  return (
 *    <>
 *      {userLocation.status === "success" ? (
 *        <Text>Location is {displayLocationText(userLocation.location)}</Text>
 *      ) : (
 *        <Text>Error loading location</Text>
 *      )}
 *    </>
 *  )
 * }
 * ```
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
