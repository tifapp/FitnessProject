import { Cancellable, cancelOnAborted } from "@lib/Cancellable"
import { CurrentUserEvent } from "@lib/events"
import { useState } from "react"
import { UseQueryResult, useQuery, useQueryClient } from "react-query"
import {
  ExploreEventsData,
  ExploreEventsInitialCenter,
  SAN_FRANCISCO_DEFAULT_REGION,
  createDefaultMapRegion,
  initialCenterToRegion
} from "./models"
import {
  useRequestForegroundLocationPermissions,
  useUserCoordinatesQuery
} from "@hooks/UserLocation"
import { Region } from "@lib/location"
import { QueryHookOptions } from "@lib/ReactQuery"
import { LocationAccuracy, PermissionResponse } from "expo-location"

export type UseExploreEventsEnvironment = {
  region?: Region
  fetchEvents: (region: Region) => Cancellable<CurrentUserEvent[]>
  isSignificantlyDifferentRegions: (r1: Region, r2: Region) => boolean
}

/**
 * A hook to provide the data and current region for the event exploration view.
 */
export const useExploreEvents = (
  initialCenter: ExploreEventsInitialCenter,
  { fetchEvents, isSignificantlyDifferentRegions }: UseExploreEventsEnvironment
) => {
  const { region, panToRegion } = useExploreEventsRegion(initialCenter)
  const { events, cancel } = useExploreEventsQuery(region!, fetchEvents, {
    enabled: !!region
  })
  return {
    region,
    data: eventsQueryToExploreEventsData(events),
    updateRegion: (newRegion: Region) => {
      if (!region) {
        panToRegion(newRegion)
      } else if (isSignificantlyDifferentRegions(region, newRegion)) {
        cancel()
        setTimeout(() => panToRegion(newRegion), 300)
      }
    }
  }
}

const eventsQueryToExploreEventsData = (
  query: UseQueryResult<CurrentUserEvent[], unknown>
): ExploreEventsData => {
  if (query.isIdle || query.isLoading) {
    return { status: "loading" }
  }
  if (query.status === "success" && query.data.length === 0) {
    return { status: "no-results", events: [] }
  }
  if (query.isError) {
    return { status: "error", retry: query.refetch }
  }
  return { status: "success", events: query.data }
}

const useExploreEventsRegion = (initialCenter: ExploreEventsInitialCenter) => {
  const [pannedRegion, setPannedRegion] = useState(
    initialCenterToRegion(initialCenter)
  )
  const userRegion = useUserRegion({ enabled: !pannedRegion })
  const region =
    userRegion.status === "loading"
      ? undefined
      : pannedRegion ?? userRegion.data ?? SAN_FRANCISCO_DEFAULT_REGION
  return { region, panToRegion: setPannedRegion }
}

type UserRegionResult =
  | { status: "loading" }
  | { status: "loaded"; data?: Region }

const useUserRegion = (
  options?: QueryHookOptions<PermissionResponse>
): UserRegionResult => {
  const permissionQuery = useRequestForegroundLocationPermissions(options)
  const locationQuery = useUserCoordinatesQuery(
    { accuracy: LocationAccuracy.Balanced },
    {
      enabled: permissionQuery.data !== undefined
    }
  )
  if (permissionQuery.isLoading || locationQuery.isLoading) {
    return { status: "loading" }
  }
  const coords = locationQuery.data ? locationQuery.data?.coords : undefined
  return {
    status: "loaded",
    data: !coords
      ? undefined
      : createDefaultMapRegion({
        latitude: coords.latitude,
        longitude: coords.longitude
      })
  }
}

const useExploreEventsQuery = (
  region: Region,
  fetchEvents: (region: Region) => Cancellable<CurrentUserEvent[]>,
  options?: QueryHookOptions<CurrentUserEvent[]>
) => {
  const queryClient = useQueryClient()
  return {
    events: useQuery(
      ["explore-events", region],
      async ({ signal }) => {
        const events = await cancelOnAborted(fetchEvents(region), signal).value

        events.forEach((event) => {
          queryClient.setQueryData(["event", event.id], event)
        })

        return events
      },
      options
    ),
    cancel: () => {
      queryClient.cancelQueries({ queryKey: ["explore-events", region] })
    }
  }
}
