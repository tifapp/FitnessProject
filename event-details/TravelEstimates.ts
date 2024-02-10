import { QueryHookOptions } from "@lib/ReactQuery"
import { useUserCoordinatesQuery } from "@location/UserLocation"
import { LocationCoordinate2D } from "@shared-models/Location"
import { useQuery } from "@tanstack/react-query"
import { LocationAccuracy } from "expo-location"
import { Platform } from "react-native"
import { EventTravelEstimates } from "@shared-models/TravelEstimates"
import { ExpoTiFTravelEstimatesModule } from "@modules/tif-travel-estimates"

export type LoadEventTravelEstimates = (
  userCoordinate: LocationCoordinate2D,
  eventCoordinate: LocationCoordinate2D,
  abortSignal?: AbortSignal
) => Promise<EventTravelEstimates>

/**
 * Loads travel estimates for an event.
 *
 * @param eventCoordinate The coordinate of the event.
 * @param userCoordinate The user's location current coordinate.
 * @param nativeTravelEstimates The native module for loading travel estimates.
 * @param signal An {@link AbortSignal} to cancel the request.
 */
export const loadEventTravelEstimates = async (
  eventCoordinate: LocationCoordinate2D,
  userCoordinate: LocationCoordinate2D,
  nativeTravelEstimates: ExpoTiFTravelEstimatesModule,
  signal?: AbortSignal
) => {
  signal?.addEventListener("abort", () => {
    nativeTravelEstimates.cancelTravelEstimatesAsync(
      userCoordinate,
      eventCoordinate
    )
  })
  return await nativeTravelEstimates.travelEstimatesAsync(
    userCoordinate,
    eventCoordinate
  )
}

export type UseEventTravelEstimatesResult =
  | { status: "loading" | "error" | "unsupported" }
  | { status: "success"; data: EventTravelEstimates }

/**
 * A hook to load travel estimates for an event location from the user's
 * current location.
 *
 * **🟡 Android Note:** On android, the return value of this hook is always:
 *
 * `{ status: "unsupported" }`
 */
export const useEventTravelEstimates = (
  coordinate: LocationCoordinate2D,
  loadTravelEstimates: LoadEventTravelEstimates
): UseEventTravelEstimatesResult => {
  const isSupported = Platform.OS !== "android"
  const userLocationQuery = useUserCoordinatesQuery(
    { accuracy: LocationAccuracy.BestForNavigation },
    { enabled: isSupported }
  )
  const etaResults = useEventTravelEstimatesQuery(
    userLocationQuery.data?.coords!,
    coordinate,
    loadTravelEstimates,
    { enabled: !!userLocationQuery.data && isSupported }
  )
  if (!isSupported) {
    return { status: "unsupported" }
  } else if (userLocationQuery.isError) {
    return userLocationQuery
  } else {
    return etaResults
  }
}

const useEventTravelEstimatesQuery = (
  userCoordinate: LocationCoordinate2D,
  eventCoordinate: LocationCoordinate2D,
  loadTravelEstimates: LoadEventTravelEstimates,
  options?: QueryHookOptions<EventTravelEstimates>
) => {
  return useQuery(
    ["event-travel-estimates", eventCoordinate, userCoordinate],
    async ({ signal }) => {
      return await loadTravelEstimates(userCoordinate, eventCoordinate, signal)
    },
    options
  )
}
