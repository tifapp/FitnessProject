import { Cancellable, cancelOnAborted } from "@lib/Cancellable"
import { CurrentUserEvent } from "@lib/events"
import { useState } from "react"
import { useQuery, useQueryClient } from "react-query"
import {
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
  const { events, cancel } = useExploreEventsQuery(region, fetchEvents)
  return {
    region,
    events,
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

const useExploreEventsRegion = (initialCenter: ExploreEventsInitialCenter) => {
  const [pannedRegion, setPannedRegion] = useState(
    initialCenterToRegion(initialCenter)
  )
  const userRegion = useUserRegionQuery({ enabled: !pannedRegion })
  const region =
    userRegion.status === "loading"
      ? undefined
      : pannedRegion ?? userRegion.data ?? SAN_FRANCISCO_DEFAULT_REGION
  return { region, panToRegion: setPannedRegion }
}

type UserRegionResult =
  | { status: "loading" }
  | { status: "loaded"; data?: Region }

const useUserRegionQuery = (
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
  region: Region | undefined,
  fetchEvents: (region: Region) => Cancellable<CurrentUserEvent[]>
) => {
  const queryClient = useQueryClient()
  return {
    events: useQuery(
      ["explore-events", region],
      async ({ signal }) => {
        // NB: The signal is only undefined if the platform does not support the AbortController
        // api, but react-native added support in 0.60, so the force unwrap should be fine.
        const events = await cancelOnAborted(fetchEvents(region!), signal!)
          .value

        events.forEach((event) => {
          queryClient.setQueryData(["event", event.id], event)
        })

        return events
      },
      { enabled: !!region }
    ),
    cancel: () => {
      queryClient.cancelQueries({ queryKey: ["explore-events", region] })
    }
  }
}
