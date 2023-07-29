import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState
} from "react"
import { QueryHookOptions } from "@lib/ReactQuery"
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
import {
  LocationObject,
  LocationOptions,
  PermissionResponse
} from "expo-location"
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

  /**
   * A dependency key for requesting location foreground permissions.
   */
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
  locationOptions: LocationOptions,
  options?: QueryHookOptions<LocationObject>
) => {
  const { getCurrentLocation } = useUserLocationFunctions()
  return useQuery(
    ["user-coordinates", locationOptions],
    async () => await getCurrentLocation(locationOptions),
    options
  )
}

/**
 * Requests permission for location foreground permissions and returns a `true`
 * result if the permissions were granted.
 */
export const useRequestForegroundLocationPermissions = (
  options?: QueryHookOptions<PermissionResponse>
) => {
  const { requestForegroundPermissions } = useUserLocationFunctions()
  return useQuery(
    ["request-location-foreground-permissions"],
    async () => await requestForegroundPermissions(),
    options
  )
}

export type UserLocationFunctions = {
  getCurrentLocation: (options: LocationOptions) => Promise<LocationObject>
  requestForegroundPermissions: () => Promise<PermissionResponse>
}

const UserLocationFunctionsContext = createContext<
  UserLocationFunctions | undefined
>(undefined)

/**
 * The current functions that handle user location based operations.
 */
export const useUserLocationFunctions = () =>
  useContext(UserLocationFunctionsContext)!

export type UserLocationFunctionsProviderProps = UserLocationFunctions & {
  children: ReactNode
}

/**
 * Provides a context of functions that operate on the user's current location.
 */
export const UserLocationFunctionsProvider = ({
  children,
  ...props
}: UserLocationFunctionsProviderProps) => (
  <UserLocationFunctionsContext.Provider value={props}>
    {children}
  </UserLocationFunctionsContext.Provider>
)
