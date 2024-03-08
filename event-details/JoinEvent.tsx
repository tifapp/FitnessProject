import { PrimaryButton } from "@components/Buttons"
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
import React, { useEffect, useRef, useState } from "react"
import { Alert, StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { TouchableIonicon } from "@components/common/Icons"
import { BodyText, Headline, Title } from "@components/Text"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useSharedValue } from "react-native-reanimated"
import { FontScaleFactors } from "@lib/Fonts"
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView
} from "@gorhom/bottom-sheet"
import { TiFAPI } from "@api-client/TiFAPI"
import { RecentLocationsStorage } from "@location/search"
import { JoinEventResponse } from "@shared-models/JoinEvent"

export const JOIN_EVENT_ERROR_ALERTS = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  "event-has-ended": {
    title: "Event has ended",
    description: "This event has ended, tbd tbd tbd"
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  "event-was-cancelled": {
    title: "Event was canceled",
    description: "This event was canceled, tbd tbd tbd"
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  "user-is-blocked": {
    title: "Event Access Restricted",
    description: "The host has restricted you from joining this event."
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
    kind: "notifications",
    canRequestPermission: (await getNotificationPermissions()).canAskAgain,
    requestPermission: async () => {
      await requestNotificationPermissions()
    }
  } as const,
  {
    kind: "backgroundLocation",
    canRequestPermission: (await getBackgroundLocationPermissions())
      .canAskAgain,
    requestPermission: async () => {
      await requestBackgroundLocationPermissions()
    }
  } as const
]

export type JoinEventPermissionKind = "notifications" | "backgroundLocation"

export type JoinEventPermission = {
  kind: JoinEventPermissionKind
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
  | "user-is-blocked"

export type JoinEventRequest = Pick<CurrentUserEvent, "id"> & {
  location: Omit<EventLocation, "timezoneIdentifier">
  hasArrived: boolean
}

/**
 * A payload given to a success handler that runs when the user joins an event
 * successfully.
 */
export type JoinEventHandlerSuccessInput = Pick<
  JoinEventResponse,
  "token" | "upcomingRegions"
> & {
  location: Pick<EventLocation, "coordinate" | "placemark">
}

export type JoinEventSuccessHandler = (
  resp: JoinEventHandlerSuccessInput
) => void

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
  onSuccessHandlers: JoinEventSuccessHandler[]
): Promise<JoinEventResult> => {
  const shouldIncludeArrivalRegion =
    request.hasArrived && request.location.isInArrivalTrackingPeriod
  const arrivalRegion = {
    coordinate: request.location.coordinate,
    arrivalRadiusMeters: request.location.arrivalRadiusMeters
  }
  const resp = await tifAPI.joinEvent(
    request.id,
    shouldIncludeArrivalRegion ? arrivalRegion : null
  )
  if (resp.status === 403) {
    return resp.data.error
  }
  onSuccessHandlers.forEach((handler) => {
    handler({
      ...resp.data,
      location: request.location
    })
  })
  return "success"
}

/**
 * A join event handler that saves the location of the event in
 * {@link RecentLocationsStorage} with a `"joined-event"` annotation.
 */
export const saveRecentLocationJoinEventHandler = async (
  input: Pick<JoinEventHandlerSuccessInput, "location">,
  recentLocationsStorage: RecentLocationsStorage
) => {
  if (!input.location.placemark) return
  await recentLocationsStorage.save(
    {
      coordinate: input.location.coordinate,
      placemark: input.location.placemark
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

export type UseJoinEventPermissionStage = {
  permissionKind: JoinEventPermissionKind
  requestButtonTapped: () => void
  dismissButtonTapped: () => void
}

export type UseJoinEventStage =
  | { stage: "idle"; joinButtonTapped: () => void }
  | { stage: "loading" | "success" }
  | ({ stage: "permission" } & UseJoinEventPermissionStage)

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
export const useJoinEventStages = (
  event: Omit<JoinEventRequest, "hasArrived">,
  env: UseJoinEventEnvironment
): UseJoinEventStage => {
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
  const hasJoined =
    joinEventMutation.isSuccess && joinEventMutation.data === "success"
  const isSuccess = hasJoined && currentPermission === "done"

  useEffect(() => {
    if (isSuccess) onSuccess()
  }, [isSuccess, onSuccess])

  if (hasJoined && typeof currentPermission === "object") {
    return { stage: "permission", ...currentPermission }
  } else if (isSuccess) {
    return { stage: "success" }
  } else if (
    joinEventMutation.isLoading ||
    (hasJoined && currentPermission === "loading")
  ) {
    return { stage: "loading" }
  } else {
    return { stage: "idle", joinButtonTapped: joinEventMutation.mutate }
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
      if (permissionIndex >= availablePermissions.length) return
      await availablePermissions[permissionIndex].requestPermission()
    },
    { onSuccess: () => setPermissionIndex((index) => index + 1) }
  )
  if (!availablePermissions) return "loading"
  if (permissionIndex >= availablePermissions.length) return "done"
  return {
    permissionKind: availablePermissions[permissionIndex].kind,
    requestButtonTapped: () => {
      permissionRequestMutation.mutate(availablePermissions)
    },
    dismissButtonTapped: () => setPermissionIndex((index) => index + 1)
  }
}

export type JoinEventStagesProps = {
  stage: UseJoinEventStage
  style?: StyleProp<ViewStyle>
}

export const JoinEventStagesView = ({ stage, style }: JoinEventStagesProps) => (
  <View style={style}>
    <PrimaryButton
      disabled={stage.stage !== "idle"}
      onPress={() => {
        if (stage.stage !== "idle") return
        stage.joinButtonTapped()
      }}
      maximumFontSizeMultiplier={FontScaleFactors.xxxLarge}
    >
      Join Now!
    </PrimaryButton>
    <JoinEventPermissionBannerModal currentStage={stage} />
  </View>
)

export type JoinEventPermissionBannerModalProps = {
  currentStage: UseJoinEventStage
}

const DEFAULT_SNAP_POINTS = ["50%"]

const JoinEventPermissionBannerModal = ({
  currentStage
}: JoinEventPermissionBannerModalProps) => {
  const permissionsBannerRef = useRef<BottomSheetModal>(null)
  const [displayedPermissionId, setDisplayedPermissionId] = useState<
    JoinEventPermissionKind | undefined
  >()
  const permissionStage =
    currentStage.stage === "permission" ? currentStage : undefined
  const [snapPoints, setSnapPoints] = useState<number[] | undefined>()
  const currentPermissionId =
    currentStage.stage === "permission" && currentStage.permissionKind

  const animatedIndex = useSharedValue(1)

  useEffect(() => {
    if (!currentPermissionId) return
    if (!displayedPermissionId) {
      permissionsBannerRef.current?.present()
      setDisplayedPermissionId(currentPermissionId)
    }
    const ref = permissionsBannerRef.current
    return () => ref?.dismiss()
  }, [currentPermissionId, displayedPermissionId])

  return (
    <BottomSheetModal
      ref={permissionsBannerRef}
      snapPoints={snapPoints ?? DEFAULT_SNAP_POINTS}
      handleStyle={styles.sheetHandle}
      enablePanDownToClose={false}
      onDismiss={() => {
        if (currentStage.stage !== "permission") {
          setDisplayedPermissionId(undefined)
          return
        }
        if (currentStage.permissionKind === displayedPermissionId) {
          currentStage.dismissButtonTapped()
          setDisplayedPermissionId(undefined)
        } else {
          setDisplayedPermissionId(currentStage.permissionKind)
          permissionsBannerRef.current?.present()
        }
      }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={1}
          animatedIndex={animatedIndex}
        />
      )}
    >
      <View
        onLayout={(e) => {
          if (e.nativeEvent.layout.height > 0) {
            setSnapPoints([e.nativeEvent.layout.height])
          }
        }}
      >
        {displayedPermissionId && (
          <JoinEventPermissionBanner
            {...permissionStage}
            permissionKind={displayedPermissionId}
          />
        )}
      </View>
    </BottomSheetModal>
  )
}

export type JoinEventPermissionBannerProps = {
  permissionKind: JoinEventPermissionKind
  requestButtonTapped?: () => void
  dismissButtonTapped?: () => void
  style?: StyleProp<ViewStyle>
}

const JOIN_EVENT_PERMISSION_BANNER_CONTENTS = {
  notifications: {
    title: "Don’t miss out on the fun!",
    description:
      "Enable notifications to stay informed on all the exciting events happening around you.",
    ctaText: "Turn on Notifications"
  },
  backgroundLocation: {
    title: "Don’t get left behind!",
    description:
      "Enable Location Sharing to inform others of your location in the event.",
    ctaText: "Turn on Location Sharing"
  }
}

const JoinEventPermissionBanner = ({
  permissionKind,
  requestButtonTapped,
  dismissButtonTapped,
  style
}: JoinEventPermissionBannerProps) => {
  const { title, ctaText, description } =
    JOIN_EVENT_PERMISSION_BANNER_CONTENTS[permissionKind]
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
        <TouchableIonicon
          icon={{
            name: "close",
            style: styles.dismissButton
          }}
          onPress={dismissButtonTapped}
          accessibilityLabel="Dismiss"
          accessibilityRole="button"
        />
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
    paddingBottom: 8
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
  }
})
