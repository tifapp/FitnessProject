import React, { ReactNode, createContext, useContext } from "react"
import { QueryHookOptions } from "@lib/ReactQuery"
import {
  LocationObject,
  LocationOptions,
  PermissionResponse
} from "expo-location"
import { useQuery } from "react-query"

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
