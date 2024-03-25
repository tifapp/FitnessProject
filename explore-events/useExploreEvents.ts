import { Cancellable, cancelOnAborted } from "@lib/Cancellable"
import { CurrentUserEvent } from "@shared-models/Event"
import { useState } from "react"
import { UseQueryResult, useQuery, useQueryClient } from "@tanstack/react-query"
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
} from "@location/UserLocation"
import { Region } from "@location/index"
import { QueryHookOptions } from "@lib/ReactQuery"
import { LocationAccuracy, PermissionResponse } from "expo-location"
import { eventDetailsQueryKey } from "@shared-models/query-keys/Event"

export type UseExploreEventsEnvironment = {
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
  if (query.isLoading) {
    return { status: "loading" }
  } else if (query.isSuccess && query.data.length === 0) {
    return { status: "no-results", events: [] }
  } else if (query.isError) {
    return { status: "error", retry: query.refetch }
  }
  return { status: "success", events: query.data }
}

const useExploreEventsRegion = (initialCenter: ExploreEventsInitialCenter) => {
  const [pannedRegion, setPannedRegion] = useState(
    initialCenterToRegion(initialCenter)
  )
  const userRegion = useUserRegion({ enabled: !pannedRegion })
  const exploreRegion =
    userRegion === "loading"
      ? pannedRegion
      : pannedRegion ?? userRegion ?? SAN_FRANCISCO_DEFAULT_REGION
  return { region: exploreRegion, panToRegion: setPannedRegion }
}

type UserRegionResult = "loading" | (Region | undefined)

const useUserRegion = (
  options: QueryHookOptions<PermissionResponse>
): UserRegionResult => {
  const permissionQuery = useRequestForegroundLocationPermissions(options)
  const locationQuery = useUserCoordinatesQuery(
    { accuracy: LocationAccuracy.Balanced },
    {
      enabled: permissionQuery.data !== undefined
    }
  )
  if (permissionQuery.isFetching || locationQuery.isFetching) {
    return "loading"
  }
  const coords = locationQuery.data ? locationQuery.data?.coords : undefined
  return !coords
    ? undefined
    : createDefaultMapRegion({
        latitude: coords.latitude,
        longitude: coords.longitude
      })
}

const useExploreEventsQuery = (
  region: Region,
  fetchEvents: (region: Region) => Cancellable<CurrentUserEvent[]>,
  options: QueryHookOptions<CurrentUserEvent[]>
) => {
  const queryClient = useQueryClient()
  const queryKey = ["explore-events", region]
  return {
    events: useQuery(
      queryKey,
      async ({ signal }) => {
        const events = await cancelOnAborted(fetchEvents(region), signal).value

        events.forEach((event) => {
          queryClient.setQueryData(eventDetailsQueryKey(event.id), {
            status: "success",
            event
          })
        })

        return events
      },
      options
    ),
    cancel: () => {
      queryClient.cancelQueries({ queryKey })
    }
  }
}
