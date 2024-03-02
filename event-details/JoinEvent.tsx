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
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useSharedValue } from "react-native-reanimated"
import { FontScaleFactors } from "@lib/Fonts"

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
  } as const,
  {
    id: "backgroundLocation",
    canRequestPermission: (await getBackgroundLocationPermissions())
      .canAskAgain,
    requestPermission: async () => {
      await requestBackgroundLocationPermissions()
    }
  } as const
]

export type JoinEventPermissionID = "notifications" | "backgroundLocation"

export type JoinEventPermission = {
  id: JoinEventPermissionID
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

export type UseJoinEventPermissionStage = {
  permissionId: JoinEventPermissionID
  requestButtonTapped: () => void
  dismissButtonTapped: () => void
}

export type UseJoinEventStage =
  | { id: "idle"; joinButtonTapped: () => void }
  | { id: "loading" | "success" }
  | ({ id: "permission" } & UseJoinEventPermissionStage)

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
    return { id: "permission", ...currentPermission }
  } else if (isSuccess) {
    return { id: "success" }
  } else if (
    joinEventMutation.isLoading ||
    (hasJoined && currentPermission === "loading")
  ) {
    return { id: "loading" }
  } else {
    return { id: "idle", joinButtonTapped: joinEventMutation.mutate }
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
    permissionId: availablePermissions[permissionIndex].id,
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
      disabled={stage.id !== "idle"}
      onPress={() => {
        if (stage.id !== "idle") return
        stage.joinButtonTapped()
      }}
      maximumFontSizeMultiplier={FontScaleFactors.xxxLarge}
    >
      Join Now!
    </PrimaryButton>
    <JoinEventPermissionBannerModal stage={stage} />
  </View>
)

export type JoinEventPermissionBannerModalProps = {
  stage: UseJoinEventStage
}

const DEFAULT_SNAP_POINTS = ["50%"]

const JoinEventPermissionBannerModal = ({
  stage
}: JoinEventPermissionBannerModalProps) => {
  const permissionsBannerRef = useRef<BottomSheetModal>(null)
  const [displayedPermissionId, setDisplayedPermissionId] = useState<
    JoinEventPermissionID | undefined
  >()
  const permissionStage = stage.id === "permission" ? stage : undefined
  const [snapPoints, setSnapPoints] = useState<number[] | undefined>()
  const currentPermissionId = stage.id === "permission" && stage.permissionId

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
      onDismiss={() => {
        if (stage.id !== "permission") {
          setDisplayedPermissionId(undefined)
          return
        }
        if (stage.permissionId === displayedPermissionId) {
          stage.dismissButtonTapped()
          setDisplayedPermissionId(undefined)
        } else {
          setDisplayedPermissionId(stage.permissionId)
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
            permissionId={displayedPermissionId}
          />
        )}
      </View>
    </BottomSheetModal>
  )
}

export type JoinEventPermissionBannerProps = {
  permissionId: JoinEventPermissionID
  requestButtonTapped?: () => void
  dismissButtonTapped?: () => void
  style?: StyleProp<ViewStyle>
}

const JOIN_EVENT_PERMISSION_BANNER_CONTENTS = {
  notifications: {
    title: "Don't miss out on the fun!",
    description:
      "Turn on notifications to stay informed on the latest and greatest epic fun from this event!",
    ctaText: "Turn on Notifications"
  },
  backgroundLocation: {
    title: "Inform Others when you Arrive!",
    description:
      "Turn on location sharing to inform others when you arrive less than 1 hour before the event starts.",
    ctaText: "Turn on Location Sharing"
  }
}

const JoinEventPermissionBanner = ({
  permissionId,
  requestButtonTapped,
  dismissButtonTapped,
  style
}: JoinEventPermissionBannerProps) => {
  const { title, ctaText, description } =
    JOIN_EVENT_PERMISSION_BANNER_CONTENTS[permissionId]
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
