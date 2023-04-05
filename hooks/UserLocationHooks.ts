import {
  UserLocationTrackingUpdate,
  UserLocationTrackingAccurracy,
  UserLocationDependencyKeys
} from "@lib/location/UserLocation"
import { useDependencyValue } from "@lib/dependencies"
import { useEffect, useState } from "react"

/**
 * A hook to observe the user's current location using the
 * `UserLocationDependencyKeys.track` dependency.
 *
 * @param accurracy The accurracy at which to track the user's location.
 * Defaults to `low-accurracy`.
 */
export const useUserLocation = (
  accurracy: UserLocationTrackingAccurracy = "low-accurracy"
) => {
  const trackLocation = useDependencyValue(UserLocationDependencyKeys.track)
  const [location, setLocation] = useState<UserLocationTrackingUpdate>({
    status: "undetermined"
  })

  useEffect(
    () => trackLocation(accurracy, setLocation),
    [trackLocation, accurracy]
  )

  return location
}
