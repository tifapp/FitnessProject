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
import { UserLocationDependencyKeys } from "@hooks/UserLocation"
import { useDependencyValue } from "@lib/dependencies"
import { Region } from "@lib/location"

export type UseExploreEventsEnvironment = {
  region?: Region
  fetchEvents: (region: Region) => Cancellable<CurrentUserEvent[]>
  isSignificantlyDifferentRegions: (r1: Region, r2: Region) => boolean
}

export type ExploreEventsDataResult =
  | { status: "loading" }
  | { status: "success"; data: CurrentUserEvent[] }
  | { status: "error"; retry: () => void; error: unknown }

export type UseExploreEventsResult = {
  events: ExploreEventsDataResult
  updateRegion: (newRegion: Region) => void
}

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
  const userRegion = useUserRegionQuery({ isEnabled: !pannedRegion })
  const region = userRegion.isLoading
    ? undefined
    : pannedRegion ?? userRegion.data ?? SAN_FRANCISCO_DEFAULT_REGION
  return { region, panToRegion: setPannedRegion }
}

type UseUserRegionQueryProps = {
  isEnabled: boolean
}

const useUserRegionQuery = ({ isEnabled }: UseUserRegionQueryProps) => {
  const queryUserCoordinates = useDependencyValue(
    UserLocationDependencyKeys.currentCoordinates
  )
  const requestPermission = useDependencyValue(
    UserLocationDependencyKeys.requestForegroundPermissions
  )
  return useQuery(
    ["explore-events-user-region"],
    async () => {
      const isGranted = await requestPermission()
      if (!isGranted) throw new Error("Foreground location permission denied.")
      const trackedCoordinate = await queryUserCoordinates("approximate-medium")
      return createDefaultMapRegion(trackedCoordinate.coordinates)
    },
    { enabled: isEnabled }
  )
}

const useExploreEventsQuery = (
  region: Region | undefined,
  fetchEvents: (region: Region) => Cancellable<CurrentUserEvent[]>
) => {
  const events = useQuery(
    ["explore-events", region],
    async ({ signal }) => {
      // NB: The signal is only undefined if the platform does not support the AbortController
      // api, but react-native added support in 0.60, so the force unwrap should be fine.
      return await cancelOnAborted(fetchEvents(region!), signal!).value
    },
    { enabled: !!region }
  )
  const queryClient = useQueryClient()
  return {
    events,
    cancel: () => {
      queryClient.cancelQueries({ queryKey: ["explore-events", region] })
    }
  }
}
