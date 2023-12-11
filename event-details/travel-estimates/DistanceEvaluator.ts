import { QueryHookOptions } from "@lib/ReactQuery"
import { LocationCoordinate2D } from "@location/Location"
import { QueryClient, UseQueryResult, useQuery } from "@tanstack/react-query"

type RouteKind = "automobile" | "walking" | "public-transport" | "bike"

type ETAInformation = {
  localizedWarnings: string[]
  totalSecondsFromSource: number
}

type CamelCaseRouteKeyName<Kind extends RouteKind> =
  Kind extends "public-transport" ? "publicTransport" : Kind

export type TravelEstimates = {
  sourceLocation: LocationCoordinate2D
} & { [Key in CamelCaseRouteKeyName<RouteKind>]?: ETAInformation }

export type DistanceETAData =
  | { status: "loading"; data: undefined }
  | { status: "success"; data: TravelEstimates }
  | { status: "error"; data: undefined }

/**
 * A wrapper function that calls on React Query to calculate the ETA.
 */
export const useCalculateETA = (
  queryClient: QueryClient,
  eventLocation: LocationCoordinate2D,
  loadETAFromLocations: (
    eventLocation: LocationCoordinate2D
  ) => Promise<TravelEstimates>,
  options?: QueryHookOptions<TravelEstimates>
): DistanceETAData => {
  const queryKey = ["testing-ETA", eventLocation]
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
  queryClient.setQueryData(["etaUserLocation", etaInfo.sourceLocation], etaInfo)
}
