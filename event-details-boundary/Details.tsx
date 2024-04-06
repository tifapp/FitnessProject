import { UseQueryResult } from "@tanstack/react-query"
import {
  BlockedEvent,
  CurrentUserEvent,
  EventID,
  currentUserEventFromResponse
} from "@shared-models/Event"
import { useIsConnectedToInternet } from "@lib/InternetConnection"
import React, { useRef, useState } from "react"
import { TiFAPI } from "TiFShared/api"
import { StyleProp, View, ViewStyle, StyleSheet } from "react-native"
import { BodyText, Subtitle, Title } from "@components/Text"

import { PrimaryButton } from "@components/Buttons"
import { useConst } from "@lib/utils/UseConst"
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated"
import { TiFDefaultLayoutTransition } from "@lib/Reanimated"
import { AppStyles } from "@lib/AppColorStyle"
import { useAutocorrectingInterval } from "@lib/utils/UseInterval"
import { EventDetailsLoadingResult, useEventDetailsQuery } from "./Query"

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
  eventId: EventID,
  loadEvent: (id: EventID) => Promise<EventDetailsLoadingResult>
): UseLoadEventDetailsResult => {
  const query = useEventDetailsQuery(eventId, loadEvent)
  return loadEventDetailsResult(query, useIsConnectedToInternet())
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

export type EventDetailsProps = {
  result: UseLoadEventDetailsResult
  onExploreOtherEventsTapped: () => void
  style?: StyleProp<ViewStyle>
}

/**
 * The main event details view.
 */
export const EventDetailsView = ({
  result,
  onExploreOtherEventsTapped,
  style
}: EventDetailsProps) => (
  <View style={style}>
    {result.status === "loading" && (
      <NoContentView
        renderTitle={(title) => <LoadingTitleView title={title} />}
        possibleMessages={LOADING_MESSAGES}
        style={styles.noContent}
      />
    )}
    {result.status === "error" && (
      <NoContentView
        onActionButtonTapped={result.retry}
        actionButtonTitle="Try Again"
        possibleMessages={
          result.isConnectedToInternet
            ? GENERIC_ERROR_MESSAGES
            : INTERNET_ERROR_MESSAGES
        }
        style={styles.noContent}
      />
    )}
    {isExploratoryFailure(result.status) && (
      <NoContentView
        onActionButtonTapped={onExploreOtherEventsTapped}
        actionButtonTitle="Explore Other Events"
        possibleMessages={UNSUCCESSFUL_MESSAGE_SET[result.status]}
        style={styles.noContent}
      />
    )}
    {result.status === "success" && <Title>TODO</Title>}
  </View>
)

const isExploratoryFailure = (
  status: UseLoadEventDetailsResult["status"]
): status is "not-found" | "cancelled" | "blocked" => {
  return status !== "success" && status !== "error" && status !== "loading"
}

const LoadingTitleView = ({ title }: { title: string }) => {
  const balls = useDisplayedEventDetailsLoadingBalls(700)
  return (
    <View
      accessible
      accessibilityLabel={title}
      style={styles.loadingTitleTextContainer}
    >
      <View style={styles.loadingTitleSpacer} />
      <Animated.View layout={TiFDefaultLayoutTransition}>
        <Subtitle style={styles.loadingTitleText}>{title}</Subtitle>
      </Animated.View>
      {balls.map((isShowing, i) => (
        <Animated.View
          layout={TiFDefaultLayoutTransition}
          key={`loading-ball-${i}`}
        >
          {isShowing && (
            <Animated.View
              entering={ZoomIn.duration(300)}
              exiting={ZoomOut.duration(300)}
            >
              {/* TODO: - Have each ball be some kind of sports ball. */}
              <View style={styles.loadingBall} />
            </Animated.View>
          )}
        </Animated.View>
      ))}
      <View style={styles.loadingTitleSpacer} />
    </View>
  )
}

/**
 * A hook that determines when to display the loading balls for the
 * event details loading animation.
 */
export const useDisplayedEventDetailsLoadingBalls = (
  intervalMillis: number
) => {
  const [balls, setBalls] = useState([false, false, false])
  const indexRef = useRef(0)
  useAutocorrectingInterval(() => {
    setBalls((balls) => {
      if (indexRef.current === balls.length) {
        indexRef.current = 0
        return [false, false, false]
      } else {
        return balls.with(indexRef.current++, true)
      }
    })
  }, intervalMillis)
  return balls
}

const loadingMessage = (message: string) => ({
  title: "Locating",
  message
})

const LOADING_MESSAGES = [
  loadingMessage("Hang tight."),
  loadingMessage("Stay put."),
  loadingMessage("Hang on a sec."),
  loadingMessage("Bear with us."),
  loadingMessage("Just a moment.")
]

const UNSUCCESSFUL_MESSAGE_SET = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  "not-found": [
    {
      title: "Yikes!",
      message: "Event not found. Tap here to explore other events in the area."
    },
    {
      title: "Oh no!",
      message:
        "We couldn’t find this event. Tap here to explore other events in the area."
    },
    {
      title: "Oh my!",
      message:
        "This event could not be located. Tap here to explore other events in the area."
    },
    {
      title: "Oh no!",
      message:
        "Unable to locate this event. Tap here to explore other events in the area."
    },
    {
      title: "Yikes!",
      message:
        "This event is unavailable. Tap here to explore other events in the area."
    }
  ],
  cancelled: [
    {
      title: "Bummer!",
      message:
        "This event was canceled. Tap here to explore other events in the area."
    },
    {
      title: "Bummer!",
      message:
        "This event is no longer taking place. Tap here to explore other events in the area."
    },
    {
      title: "Sorry!",
      message:
        "This event has been canceled. Tap here to explore other events in the area."
    },
    {
      title: "Sorry!",
      message:
        "This event is no longer happening. Tap here to explore other events in the area."
    }
  ],
  blocked: [
    {
      title: "Uh oh!",
      message:
        "You don’t have access to this event. Tap here to explore other events in the area."
    },
    {
      title: "Sorry!",
      message:
        "You are restricted from this event. Tap here to explore other events in the area."
    },
    {
      title: "Sorry!",
      message:
        "You are not permitted to attend this event. Tap here to explore other events in the area."
    },
    {
      title: "Oh no!",
      message:
        "Admission to this event is restricted. Tap here to explore other events in the area."
    },
    {
      title: "Uh oh!",
      message:
        "You are not eligible to attend this event. Tap here to explore other events in the area."
    }
  ],
  ended: [
    {
      title: "That’s a wrap!",
      message: "This event has ended. Tap here to plan your next adventure."
    },
    {
      title: "All done!",
      message: "This event has concluded. Tap here to plan your next adventure."
    },
    {
      title: "All done!",
      message:
        "This event has come to an end. Tap here to plan your next adventure."
    },
    {
      title: "That’s a wrap!",
      message: "This event is over. Tap here to plan your next adventure."
    },
    {
      title: "That’s a wrap!",
      message: "This event is complete. Tap here to plan your next adventure."
    }
  ]
}

const GENERIC_ERROR_MESSAGES = [
  {
    title: "Uh-oh!",
    message: "Something went wrong. Please try again."
  },
  {
    title: "Uh-oh!",
    message: "We ran into an issue. Please try again."
  },
  {
    title: "Oh no!",
    message: "An error has occurred. Please try again."
  },
  {
    title: "Oh no!",
    message: "This action has failed. Please try again."
  },
  {
    title: "Whoops!",
    message: "There was a problem. Please try again."
  }
]

const INTERNET_ERROR_MESSAGES = [
  {
    title: "Whoops!",
    message:
      "Poor network connection. Check your internet connection and try again."
  },
  {
    title: "Oh no!",
    message:
      "Unstable network detected. Check your internet connection and try again."
  },
  {
    title: "Uh-oh!",
    message:
      "Network issues detected. Check your internet connection and try again."
  },
  {
    title: "Oh no!",
    message:
      "Network connection is unstable. Check your internet connection and try again."
  },
  {
    title: "Uh oh!",
    message:
      "Weak signal detected. Check your internet connection and try again."
  }
]

type NoContentProps = {
  style?: StyleProp<ViewStyle>
  renderTitle?: (title: string) => JSX.Element
  possibleMessages: {
    title: string
    message: string
  }[]
  actionButtonTitle?: string
  onActionButtonTapped?: () => void
}

const NoContentView = ({
  style,
  renderTitle,
  possibleMessages,
  actionButtonTitle,
  onActionButtonTapped
}: NoContentProps) => {
  const { title, message } = useConst(possibleMessages.ext.randomElement())
  return (
    <View style={style}>
      <View style={styles.noContentContainer}>
        <View style={styles.noContentPlaceholderIllustration} />
        {renderTitle ? (
          renderTitle(title)
        ) : (
          <Subtitle style={styles.noContentTitleText}>{title}</Subtitle>
        )}
        <BodyText style={styles.noContentMessageText}>{message}</BodyText>
        {onActionButtonTapped && actionButtonTitle && (
          <PrimaryButton
            style={styles.noContentErrorActionButton}
            onPress={onActionButtonTapped}
          >
            {actionButtonTitle}
          </PrimaryButton>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  noContent: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center"
  },
  noContentContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginHorizontal: 24
  },
  noContentPlaceholderIllustration: {
    backgroundColor: "red",
    width: 200,
    height: 200
  },
  noContentTitleText: {
    marginVertical: 8,
    textAlign: "center"
  },
  noContentMessageText: {
    opacity: 0.5,
    textAlign: "center"
  },
  noContentErrorActionButton: {
    marginTop: 16
  },
  loadingTitleTextContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    marginVertical: 8
  },
  loadingTitleSpacer: {
    flex: 1
  },
  loadingTitleText: {
    marginHorizontal: 6
  },
  loadingBall: {
    width: 12,
    height: 12,
    borderRadius: 32,
    marginHorizontal: 2,
    marginBottom: 2,
    backgroundColor: AppStyles.darkColor
  }
})
