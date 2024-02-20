import { UseQueryResult, useQuery } from "@tanstack/react-query"
import {
  BlockedEvent,
  CurrentUserEvent,
  currentUserEventFromResponse
} from "@shared-models/Event"
import { useIsConnectedToInternet } from "@lib/InternetConnection"
import React, { useEffect, useMemo } from "react"
import { useEffectEvent } from "@lib/utils/UseEffectEvent"
import { TiFAPI } from "@api-client/TiFAPI"
import { StyleProp, View, ViewStyle, StyleSheet } from "react-native"
import { BodyText, Subtitle } from "@components/Text"
import { ArrayUtils } from "@lib/utils/Array"
import { PrimaryButton } from "@components/Buttons"

/**
 * A result from loading a single event for the details screen.
 */
export type EventDetailsLoadingResult =
  | { status: "not-found" | "cancelled" }
  | { status: "blocked"; event: BlockedEvent }
  | { status: "success"; event: CurrentUserEvent }

/**
 * Loads the event details from the server.
 *
 * A `clientReceivedTime` property is added on a successful response which is used for
 * calculating accurate countdown times.
 */
export const loadEventDetails = async (
  eventId: number,
  tifAPI: TiFAPI
): Promise<EventDetailsLoadingResult> => {
  const resp = await tifAPI.eventDetails(eventId)
  if (resp.status === 404) {
    return { status: "not-found" }
  } else if (resp.status === 403) {
    return { status: "blocked", event: resp.data }
  } else if (resp.status === 204) {
    return { status: "cancelled" }
  } else {
    return {
      status: "success",
      event: currentUserEventFromResponse(resp.data)
    }
  }
}

export type UseLoadEventDetailsResult =
  | { status: "loading" | "not-found" | "cancelled" }
  | { status: "error"; retry: () => void; isConnectedToInternet: boolean }
  | {
      status: "success"
      refreshStatus: "loading" | "error" | "idle"
      event: CurrentUserEvent
      refresh: () => void
    }
  | { status: "blocked"; event: BlockedEvent }

/**
 * A hook to load an event in the context of the details screen.
 */
export const useLoadEventDetails = (
  eventId: number,
  loadEvent: (id: number) => Promise<EventDetailsLoadingResult>
): UseLoadEventDetailsResult => {
  const query = useQuery(
    ["event", eventId],
    async () => await loadEvent(eventId)
  )
  const isConnectedToInternet = useIsConnectedToInternet()
  const refetchIfInErrorState = useEffectEvent(() => {
    if (query.status === "error") {
      query.refetch()
    }
  })
  useEffect(() => {
    if (isConnectedToInternet) {
      refetchIfInErrorState()
    }
  }, [refetchIfInErrorState, isConnectedToInternet])
  return loadEventDetailsResult(query, isConnectedToInternet)
}

const loadEventDetailsResult = (
  query: UseQueryResult<EventDetailsLoadingResult, unknown>,
  isConnectedToInternet: boolean
) => {
  if (query.status === "error" && !query.isRefetchError) {
    return {
      status: query.status,
      isConnectedToInternet,
      retry: () => {
        query.refetch()
      }
    }
  } else if (query.status === "loading") {
    return { status: query.status }
  } else if (query.data.status !== "success") {
    return query.data
  } else {
    return {
      ...query.data,
      refresh: () => {
        query.refetch()
      },
      refreshStatus: refreshStatus(query)
    }
  }
}

const refreshStatus = (
  query: UseQueryResult<EventDetailsLoadingResult, unknown>
) => {
  if (query.isRefetching) {
    return "loading" as const
  } else if (query.isRefetchError) {
    return "error" as const
  } else {
    return "idle" as const
  }
}

export type EventDetailsLoadingProps = {
  style?: StyleProp<ViewStyle>
}

export const EventDetailsLoadingView = ({
  style
}: EventDetailsLoadingProps) => (
  <BaseEventDetailsLoadingView
    title="Loading..."
    possibleMessages={LOADING_MESSAGES}
    style={style}
  />
)

const LOADING_MESSAGES = ["Hang tight.", "Stay put.", "Hold on a sec."]

export type EventDetailsCanceledProps = {
  style?: StyleProp<ViewStyle>
  onExploreOtherEventsTapped: () => void
}

export const EventDetailCanceledView = ({
  onExploreOtherEventsTapped,
  style
}: EventDetailsCanceledProps) => (
  <BaseEventDetailsLoadingView
    onActionButtonTapped={onExploreOtherEventsTapped}
    title="Bummer!"
    actionButtonTitle="Explore Other Events"
    possibleMessages={CANCELED_MESSAGES}
    style={style}
  />
)

const CANCELED_MESSAGES = [
  "This event was canceled. Click here to explore other events in the area.",
  "This event is no longer taking place. Click here to explore other events in the area.",
  "This event has been revoked. Click here to explore other events in the area."
]

export type EventDetailsErrorProps = {
  style?: StyleProp<ViewStyle>
  retry: () => void
  isConnectedToInternet: boolean
}

export const EventDetailErrorView = ({
  retry,
  isConnectedToInternet,
  style
}: EventDetailsErrorProps) => (
  <BaseEventDetailsLoadingView
    onActionButtonTapped={retry}
    title="Uh Oh!"
    actionButtonTitle="Try Again"
    possibleMessages={
      isConnectedToInternet ? GENERIC_ERROR_MESSAGES : INTERNET_ERROR_MESSAGES
    }
    style={style}
  />
)

const GENERIC_ERROR_MESSAGES = ["Something went wrong. Please try again."]

const INTERNET_ERROR_MESSAGES = [
  "Poor network connection. Check your network settings and try again.",
  "Unstable network detected. Check your network settings and try again.",
  "Network issues detected. Check your network settings and try again."
]

type BaseEventDetailsLoadingProps = {
  style?: StyleProp<ViewStyle>
  title: string
  possibleMessages: string[]
  actionButtonTitle?: string
  onActionButtonTapped?: () => void
}

const BaseEventDetailsLoadingView = ({
  style,
  title,
  possibleMessages,
  actionButtonTitle,
  onActionButtonTapped
}: BaseEventDetailsLoadingProps) => (
  <View style={[style, styles.container]}>
    <View style={styles.placeholderIllustration} />
    <Subtitle style={styles.titleText}>{title}</Subtitle>
    <BodyText style={styles.bodyText}>
      {useMemo(
        () => ArrayUtils.randomElement(possibleMessages),
        [possibleMessages]
      )}
    </BodyText>
    {onActionButtonTapped && actionButtonTitle && (
      <PrimaryButton
        style={styles.errorActionButton}
        onPress={onActionButtonTapped}
      >
        {actionButtonTitle}
      </PrimaryButton>
    )}
  </View>
)

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  placeholderIllustration: {
    backgroundColor: "red",
    width: 200,
    height: 200
  },
  titleText: {
    marginVertical: 8,
    textAlign: "center"
  },
  bodyText: {
    opacity: 0.5,
    textAlign: "center"
  },
  errorActionButton: {
    marginTop: 16
  }
})
