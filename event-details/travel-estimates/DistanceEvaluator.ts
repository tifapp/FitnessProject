import { QueryHookOptions } from "@lib/ReactQuery"
import { LocationCoordinate2D } from "@shared-models/Location"
import {
  QueryClient,
  UseQueryResult,
  useQuery,
  useQueryClient
} from "@tanstack/react-query"
import { LocationObject } from "expo-location"

type RouteKind = "automobile" | "walking" | "public-transport" | "bike"

type ETAInformation = {
  localizedWarnings: string[]
  totalSecondsFromSource: number
}

type CamelCaseRouteKeyName<Kind extends RouteKind> =
  Kind extends "public-transport" ? "publicTransport" : Kind

export type TravelEstimates = {
  userLocation: LocationObject
} & { [Key in CamelCaseRouteKeyName<RouteKind>]?: ETAInformation }

export type DistanceETAData =
  | { status: "loading"; data: undefined }
  | { status: "success"; data: TravelEstimates }
  | { status: "error"; data: undefined }

/**
 * A wrapper function that calls on React Query to calculate the ETA.
 */
export const useCalculateETA = (
  eventLocation: LocationCoordinate2D,
  loadETAFromLocations: (
    eventLocation: LocationCoordinate2D
  ) => Promise<TravelEstimates>,
  options?: QueryHookOptions<TravelEstimates>
): DistanceETAData => {
  const queryClient = useQueryClient()
  const queryKey = ["travel-ETAs", eventLocation]
  const etaResults = useQuery(
    queryKey,
    async () => {
      const etaInfo = await loadETAFromLocations(eventLocation)
      cacheETAQueryData(etaInfo, queryClient)
      return etaInfo
    },
    options
  )
  return etaQueryToData(etaResults)
}

const etaQueryToData = (
  query: UseQueryResult<TravelEstimates, unknown>
): DistanceETAData => {
  if (query.status === "success") {
    return { status: "success", data: query.data }
  } else if (query.status === "loading") {
    return { status: "loading", data: undefined }
  } else {
    return { status: "error", data: undefined }
  }
}

const cacheETAQueryData = (
  etaInfo: TravelEstimates,
  queryClient: QueryClient
) => {
  queryClient.setQueryData(
    ["user-coordinates", etaInfo.userLocation.coords],
    etaInfo
  )
}
