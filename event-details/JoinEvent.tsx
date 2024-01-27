import { EventRegionMonitor, useHasArrivedAtRegion } from "./arrival-tracking"
import { CurrentUserEvent, EventLocation } from "@shared-models/Event"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
  getBackgroundPermissionsAsync as getBackgroundLocationPermissions,
  requestBackgroundPermissionsAsync as requestBackgroundLocationPermissions
} from "expo-location"
import {
  getPermissionsAsync as getNotificationPermissions,
  requestPermissionsAsync as requestNotificationPermissions
} from "expo-notifications"
import { useEffect, useState } from "react"
import { Alert } from "react-native"

export const JOIN_EVENT_ERROR_ALERTS = {
  eventHasEnded: {
    title: "Event has ended",
    description: "This event has ended, tbd tbd tbd"
  },
  eventWasCancelled: {
    title: "Event was canceled",
    description: "This event was canceled, tbd tbd tbd"
  },
  generic: {
    title: "Uh-oh!",
    description: "Something went wrong. Please try again"
  }
}

const presentErrorAlert = (key: keyof typeof JOIN_EVENT_ERROR_ALERTS) => {
  Alert.alert(
    JOIN_EVENT_ERROR_ALERTS[key].title,
    JOIN_EVENT_ERROR_ALERTS[key].description
  )
}

export const loadJoinEventPermissions = async () => [
  {
    id: "notifications",
    canRequestPermission: (await getNotificationPermissions()).canAskAgain,
    requestPermission: async () => {
      await requestNotificationPermissions()
    }
  },
  {
    id: "backgroundLocation",
    canRequestPermission: (await getBackgroundLocationPermissions())
      .canAskAgain,
    requestPermission: async () => {
      await requestBackgroundLocationPermissions()
    }
  }
]

export type JoinEventPermission = {
  id: string
  canRequestPermission: boolean
  requestPermission: () => Promise<void>
}

export type JoinEventResult = "success" | "eventHasEnded" | "eventWasCancelled"

export type JoinEventRequest = Pick<CurrentUserEvent, "id"> & {
  location: Pick<
    EventLocation,
    "arrivalRadiusMeters" | "isInArrivalTrackingPeriod" | "coordinate"
  >
  hasArrived: boolean
}

export type UseJoinEventEnvironment = {
  monitor: EventRegionMonitor
  joinEvent: (request: JoinEventRequest) => Promise<JoinEventResult>
  loadPermissions: () => Promise<JoinEventPermission[]>
  onSuccess: () => void
}

export type UseJoinEventResult =
  | { status: "idle"; joinButtonTapped: () => void }
  | { status: "loading" | "success" }
  | {
      status: "permission"
      permissionId: string
      requestButtonTapped: () => void
      dismissButtonTapped: () => void
    }

/**
 * A hook to power the join event flow UI.
 *
 * The join event flow UI has 3 primary stages:
 * 1. User sees join button.
 *   - Represented by `status === "idle"`
 * 2. User presses join button.
 *   - Represented by `status === "loading"`
 * 3. We ask them to turn on notifications, and accept background location.
 *    permissions if joining succeeds.
 *   - Represented by `status === "permission"`
 *
 * For part 3, we display each permission as a modal with a button that
 * performs the permission request that's relevant to the modal
 * (notifications and background permissions). However, only permissions with
 * `canRequestPermission` set to true are displayed in the flow.
 */
export const useJoinEvent = (
  event: Omit<JoinEventRequest, "hasArrived">,
  env: UseJoinEventEnvironment
): UseJoinEventResult => {
  const { onSuccess, loadPermissions, joinEvent, monitor } = env
  const hasArrived = useHasArrivedAtRegion(event.location, monitor)
  const currentPermission = useCurrentJoinEventPermission(loadPermissions)
  const joinEventMutation = useMutation(
    async () => await joinEvent({ ...event, hasArrived }),
    {
      onSuccess: (status) => {
        if (status !== "success") presentErrorAlert(status)
      },
      onError: () => presentErrorAlert("generic")
    }
  )
  const isSuccess =
    joinEventMutation.isSuccess && joinEventMutation.data === "success"

  useEffect(() => {
    if (isSuccess && currentPermission === "done") onSuccess()
  }, [currentPermission, isSuccess, onSuccess])

  if (isSuccess && typeof currentPermission === "object") {
    return { status: "permission", ...currentPermission }
  } else if (isSuccess) {
    return { status: "success" }
  } else if (joinEventMutation.isLoading) {
    return { status: "loading" }
  } else {
    return { status: "idle", joinButtonTapped: joinEventMutation.mutate }
  }
}

const useCurrentJoinEventPermission = (
  loadPermissions: () => Promise<JoinEventPermission[]>
) => {
  const [permissionIndex, setPermissionIndex] = useState(0)
  const { data: availablePermissions } = useQuery(
    ["join-event-permissions"],
    loadPermissions,
    {
      select: (permissions) => permissions.filter((p) => p.canRequestPermission)
    }
  )
  const permissionRequestMutation = useMutation(
    async (availablePermissions: JoinEventPermission[]) => {
      if (permissionIndex >= loadPermissions.length) return
      await availablePermissions[permissionIndex].requestPermission()
    },
    { onSuccess: () => setPermissionIndex((index) => index + 1) }
  )
  if (!availablePermissions) return "loading"
  if (permissionIndex >= availablePermissions.length) return "done"
  return {
    permissionId: availablePermissions[permissionIndex].id,
    requestButtonTapped: () => {
      permissionRequestMutation.mutate(availablePermissions)
    },
    dismissButtonTapped: () => setPermissionIndex((index) => index + 1)
  }
}
