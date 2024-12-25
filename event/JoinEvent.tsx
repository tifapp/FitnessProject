import { EventArrivals } from "@arrival-tracking"
import {
  EventRegionMonitor,
  useHasArrivedAtRegion
} from "@arrival-tracking/region-monitoring"
import { TiFBottomSheet } from "@components/BottomSheet"
import { PrimaryButton } from "@components/Buttons"
import { IoniconCloseButton } from "@components/common/Icons"
import { BodyText, Title } from "@components/Text"
import { ClientSideEvent } from "@event/ClientSideEvent"
import { updateEventDetailsQueryEvent } from "@event/DetailsQuery"
import { BottomSheetView } from "@gorhom/bottom-sheet"
import { AlertsObject, presentAlert } from "@lib/Alerts"
import { RecentLocationsStorage } from "@location/Recents"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getBackgroundPermissionsAsync as getBackgroundLocationPermissions,
  requestBackgroundPermissionsAsync as requestBackgroundLocationPermissions
} from "expo-location"
import {
  getPermissionsAsync as getNotificationPermissions,
  requestPermissionsAsync as requestNotificationPermissions
} from "expo-notifications"
import React, { useEffect, useState } from "react"
import { StyleProp, StyleSheet, TextProps, View, ViewStyle } from "react-native"

import { useSafeAreaInsets } from "react-native-safe-area-context"
import { TiFAPI } from "TiFShared/api"
import { EventLocation } from "TiFShared/domain-models/Event"
import { EventLocationIdentifier } from "./LocationIdentifier"

export const JOIN_EVENT_ERROR_ALERTS = {
  "event-has-ended": {
    title: "Event has ended",
    description: "This event has ended, tbd tbd tbd"
  },
  "event-was-cancelled": {
    title: "Event was canceled",
    description: "This event was canceled, tbd tbd tbd"
  },
  "event-not-found": {
    title: "Event not Found",
    description: "It seems that this event does not exist."
  },
  "blocked-you": {
    title: "Event Access Restricted",
    description: "The host has restricted you from joining this event."
  },
  generic: {
    title: "Uh-oh!",
    description: "Something went wrong. Please try again"
  }
} satisfies AlertsObject

export const loadJoinEventPermissions = async () => [
  {
    kind: "notifications",
    canRequestPermission: (await getNotificationPermissions()).canAskAgain,
    requestPermission: async () => {
      await requestNotificationPermissions()
    },
    bannerContents: {
      title: "Don’t miss out on the fun!",
      description:
        "Enable notifications to stay informed on all the exciting events happening around you.",
      ctaText: "Turn on Notifications"
    }
  } as const,
  {
    kind: "backgroundLocation",
    canRequestPermission: (await getBackgroundLocationPermissions())
      .canAskAgain,
    requestPermission: async () => {
      await requestBackgroundLocationPermissions()
    },
    bannerContents: {
      title: "Don’t get left behind!",
      description:
        "Enable Location Sharing to inform others of your location in the event.",
      ctaText: "Turn on Location Sharing"
    }
  } as const
]

export type JoinEventPermissionKind = "notifications" | "backgroundLocation"

export type JoinEventPermissionBannerContents = {
  title: string
  description: string
  ctaText: string
}

export type JoinEventPermission = {
  kind: JoinEventPermissionKind
  bannerContents: JoinEventPermissionBannerContents
  canRequestPermission: boolean
  requestPermission: () => Promise<void>
}

/**
 * A user visible result of joining an event.
 */
export type JoinEventResult =
  | "success"
  | "event-has-ended"
  | "event-was-cancelled"
  | "event-not-found"
  | "blocked-you"

export type JoinEventRequest = Pick<ClientSideEvent, "id"> & {
  location: Omit<EventLocation, "timezoneIdentifier">
  hasArrived: boolean
}

/**
 * A payload given to a success handler that runs when the user joins an event
 * successfully.
 */
export type JoinEventSuccess = {
  locationIdentifier: EventLocationIdentifier
  arrivals: EventArrivals
}

/**
 * Joins an event using the TiF API, and if successful, runs the array of
 * success handlers.
 *
 * If the user has arrived at the physical location of the event, and the event
 * is within the arrival tracking period, then joining the event also will mark
 * an arrival to the event. In doing this, the API returns all the upcoming
 * regions which can then be saved to {@link EventArrivalsTracker} in one of the
 * `onSuccessHandlers`.
 */
export const joinEvent = async (
  request: JoinEventRequest,
  tifAPI: TiFAPI,
  onSuccessHandlers: ((resp: JoinEventSuccess) => void)[]
): Promise<JoinEventResult> => {
  const shouldIncludeArrivalRegion =
    request.hasArrived && request.location.isInArrivalTrackingPeriod
  const arrivalRegion = {
    coordinate: request.location.coordinate,
    arrivalRadiusMeters: request.location.arrivalRadiusMeters
  }
  const resp = await tifAPI.joinEvent({
    params: {
      eventId: request.id
    },
    body: shouldIncludeArrivalRegion ? { region: arrivalRegion } : undefined
  })
  if (resp.status === 403 || resp.status === 404) {
    return resp.data.error
  }
  if (resp.status === 201 || resp.status === 200) {
    onSuccessHandlers.forEach((handler) => {
      handler({
        arrivals: EventArrivals.fromRegions(resp.data.trackableRegions),
        locationIdentifier: request.location
      })
    })
  }
  return "success"
}

/**
 * A join event handler that saves the location of the event in
 * {@link RecentLocationsStorage} with a `"joined-event"` annotation.
 */
export const saveRecentLocationJoinEventHandler = async (
  success: Pick<JoinEventSuccess, "locationIdentifier">,
  recentLocationsStorage: RecentLocationsStorage
) => {
  if (!success.locationIdentifier.placemark) return
  await recentLocationsStorage.save(
    {
      coordinate: success.locationIdentifier.coordinate,
      placemark: success.locationIdentifier.placemark
    },
    "joined-event"
  )
}

export type UseJoinEventEnvironment = {
  monitor: EventRegionMonitor
  joinEvent: (request: JoinEventRequest) => Promise<JoinEventResult>
  loadPermissions: () => Promise<JoinEventPermission[]>
  onSuccess: () => void
}

export type UseJoinEventPermission = {
  permissionKind: JoinEventPermissionKind
  bannerContents: JoinEventPermissionBannerContents
  requestButtonTapped: () => void
  dismissButtonTapped: () => void
}

export type UseJoinEvent =
  | { stage: "idle"; joinButtonTapped: () => void }
  | { stage: "pending" | "success" }
  | ({ stage: "permission" } & UseJoinEventPermission)

/**
 * A hook to power the join event flow UI.
 *
 * The join event flow UI has 3 primary stages:
 * 1. User sees join button.
 *   - Represented by `status === "idle"`
 * 2. User presses join button.
 *   - Represented by `status === "pending"`
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
  { loadPermissions, joinEvent, monitor, onSuccess }: UseJoinEventEnvironment
): UseJoinEvent => {
  const hasArrived = useHasArrivedAtRegion(event.location, monitor)
  const currentPermission = useCurrentJoinEventPermission(loadPermissions)
  const queryClient = useQueryClient()
  const joinEventMutation = useMutation(
    {
      mutationFn: async () => await joinEvent({ ...event, hasArrived }),
      onSuccess: (status) => {
        if (status !== "success") {
          presentAlert(JOIN_EVENT_ERROR_ALERTS[status])
        } else {
          updateEventDetailsQueryEvent(queryClient, event.id, (e) => ({
            ...e,
            userAttendeeStatus: "attending"
          }))
        }
      },
      onError: () => presentAlert(JOIN_EVENT_ERROR_ALERTS.generic)
    }
  )
  const hasJoined =
    joinEventMutation.isSuccess && joinEventMutation.data === "success"
  const isSuccess = hasJoined && currentPermission === "done"
  const reset = joinEventMutation.reset

  useEffect(() => {
    if (!isSuccess) return
    onSuccess()
    reset()
  }, [isSuccess, onSuccess, reset])

  if (hasJoined && typeof currentPermission === "object") {
    return { stage: "permission", ...currentPermission }
  } else if (
    joinEventMutation.isPending ||
    (hasJoined && currentPermission === "pending")
  ) {
    return { stage: "pending" }
  } else {
    return { stage: "idle", joinButtonTapped: joinEventMutation.mutate }
  }
}

const useCurrentJoinEventPermission = (
  loadPermissions: () => Promise<JoinEventPermission[]>
) => {
  const [permissionIndex, setPermissionIndex] = useState(0)
  const { data: availablePermissions } = useQuery(
    {
      queryKey: ["join-event-permissions"],
      queryFn: loadPermissions,
      select: (permissions) => permissions.filter((p) => p.canRequestPermission)
    }
  )
  const permissionRequestMutation = useMutation(
    {
      mutationFn: async (availablePermissions: JoinEventPermission[]) => {
        if (permissionIndex >= availablePermissions.length) return
        await availablePermissions[permissionIndex].requestPermission()
      },
      onSuccess: () => setPermissionIndex((index) => index + 1)
    }
  )
  if (!availablePermissions) return "pending"
  if (permissionIndex >= availablePermissions.length) return "done"
  return {
    permissionKind: availablePermissions[permissionIndex].kind,
    bannerContents: availablePermissions[permissionIndex].bannerContents,
    requestButtonTapped: () => {
      permissionRequestMutation.mutate(availablePermissions)
    },
    dismissButtonTapped: () => setPermissionIndex((index) => index + 1)
  }
}

export type JoinEventButtonProps = {
  state: UseJoinEvent
  Text: (props: TextProps) => JSX.Element
  maximumFontSizeMultipler?: number
  style?: StyleProp<ViewStyle>
}

export const JoinEventButton = ({
  state,
  Text,
  maximumFontSizeMultipler,
  style
}: JoinEventButtonProps) => (
  <PrimaryButton
    disabled={state.stage !== "idle"}
    onPress={() => {
      if (state.stage !== "idle") return
      state.joinButtonTapped()
    }}
    style={style}
  >
    <Text
      maxFontSizeMultiplier={maximumFontSizeMultipler}
      style={styles.joinText}
    >
      Join Now!
    </Text>
  </PrimaryButton>
)

export type JoinEventPermissionsSheetProps = {
  state: UseJoinEvent
  style?: StyleProp<ViewStyle>
}

export const JoinEventPermissionsSheetView = ({
  state,
  style
}: JoinEventPermissionsSheetProps) => (
  <TiFBottomSheet
    item={state.stage === "permission" ? state : undefined}
    sizing="content-size"
    handleStyle={styles.sheetHandle}
    canSwipeToDismiss={false}
    onDismiss={() => {
      if (state.stage !== "permission") return
      state.dismissButtonTapped()
    }}
    style={style}
  >
    {(state) => (
      <BottomSheetView>
        <JoinEventPermissionBanner {...state} />
      </BottomSheetView>
    )}
  </TiFBottomSheet>
)

type JoinEventPermissionBannerProps = UseJoinEventPermission & {
  style?: StyleProp<ViewStyle>
}

const JoinEventPermissionBanner = ({
  bannerContents: { title, ctaText, description },
  requestButtonTapped,
  dismissButtonTapped,
  style
}: JoinEventPermissionBannerProps) => {
  const { bottom } = useSafeAreaInsets()
  const paddingForNonSafeAreaScreens = bottom === 0 ? 24 : 0
  return (
    <View
      style={[
        style,
        styles.container,
        { marginBottom: bottom + 24 + paddingForNonSafeAreaScreens }
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.topRowSpacer} />
        <IoniconCloseButton onPress={dismissButtonTapped} />
      </View>
      <Title style={styles.titleText}>{title}</Title>
      <BodyText style={styles.bodyText}>{description}</BodyText>
      <View style={styles.placeholderIllustration} />
      <PrimaryButton onPress={requestButtonTapped} style={styles.ctaButton}>
        {ctaText}
      </PrimaryButton>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24
  },
  topRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 16
  },
  topRowSpacer: {
    flex: 1
  },
  titleText: {
    textAlign: "center"
  },
  sheetHandle: {
    opacity: 0
  },
  bodyText: {
    opacity: 0.5,
    marginTop: 8,
    textAlign: "center"
  },
  ctaButton: {
    width: "100%"
  },
  dismissButton: {
    opacity: 0.35
  },
  placeholderIllustration: {
    width: "100%",
    height: 200,
    backgroundColor: "red",
    marginVertical: 16
  },
  joinText: {
    color: "white"
  }
})
