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
  options?: QueryHookOptions<boolean>
): UserRegionResult => {
  const permissionQuery = useRequestForegroundLocationPermissions(options)
  const locationQuery = useUserCoordinatesQuery("approximate-medium", {
    enabled: permissionQuery.data !== undefined
  })
  if (permissionQuery.isLoading || locationQuery.isLoading) {
    return { status: "loading" }
  }
  return {
    status: "loaded",
    data: !locationQuery.data
      ? undefined
      : createDefaultMapRegion(locationQuery.data.coordinates)
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
        // NB: The signal is only undefined if the platform does not support the AbortController
        // api, but react-native added support in 0.60, so the force unwrap should be fine.
        console.log("ABORT SIGNAL", signal)
        const events = await cancelOnAborted(fetchEvents(region), signal!).value

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
