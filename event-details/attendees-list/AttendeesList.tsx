import { TiFAPI } from "@api-client/TiFAPI"
import { BodyText, Subtitle } from "@components/Text"
import { ArrayUtils } from "@lib/utils/Array"
import { EventAttendee } from "@shared-models/Event"
import { useInfiniteQuery } from "@tanstack/react-query"
import React, { useMemo } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"

export type EventAttendeesPage = {
  attendees: EventAttendee[]
  attendeeCount: number
  nextPageKey: string | null
}

/**
 * A result from loading a single event for the details screen.
 */
export type EventAttendeesLoadingResult =
  | { status: "not-found" | "cancelled" | "blocked" }
  | { status: "success"; eventAttendeesPage: EventAttendeesPage }

/**
 * Loads an attendees list page from the server.
 */
export const loadEventAttendeesPage = async (
  eventId: number,
  pageSize: number,
  tifAPI: TiFAPI,
  nextPageKey?: string
): Promise<EventAttendeesLoadingResult> => {
  const resp = await tifAPI.attendeesList(eventId, pageSize, nextPageKey)
  if (resp.status === 404) {
    return { status: "not-found" }
  } else if (resp.status === 403) {
    return { status: "blocked" }
  } else if (resp.status === 204) {
    return { status: "cancelled" }
  } else {
    return {
      status: "success",
      eventAttendeesPage: {
        ...resp.data
      }
    }
  }
}

export const useAttendeesList = (
  fetchNextAttendeesPage: (
    eventId: number,
    pageSize: number,
    nextPageKey?: string
  ) => Promise<EventAttendeesPage>,
  eventId: number,
  pageSize: number
) => {
  const infiniteAttendeesQuery = useInfiniteQuery<EventAttendeesPage, Error>({
    queryKey: ["eventAttendees", eventId],
    queryFn: async ({ pageParam }) => {
      return await fetchNextAttendeesPage(eventId, pageSize, pageParam)
    },
    getNextPageParam: (lastPage) => lastPage.nextPageKey
  })

  return {
    host:
      infiniteAttendeesQuery.data &&
      infiniteAttendeesQuery.data.pages[0].attendees.length > 0
        ? infiniteAttendeesQuery.data.pages[0].attendees[0]
        : undefined,
    attendeePages:
      infiniteAttendeesQuery.data?.pages.map((page, index) => {
        if (index === 0) return page.attendees.slice(1)
        return page.attendees
      }) ?? [],
    status: infiniteAttendeesQuery.status,
    error: infiniteAttendeesQuery.error,
    fetchNextGroup: infiniteAttendeesQuery.hasNextPage
      ? () => {
        infiniteAttendeesQuery.fetchNextPage()
      }
      : undefined,
    attendeeCount:
      infiniteAttendeesQuery.data?.pages[
        infiniteAttendeesQuery.data.pages.length - 1
      ].attendeeCount
  }
}

export type AttendeesListLoadingProps = {
  style?: StyleProp<ViewStyle>
}

export const AttendeesListLoadingView = ({
  style
}: AttendeesListLoadingProps) => (
  <BaseAttendeesListLoadingView
    title="Loading..."
    possibleMessages={LOADING_MESSAGES}
    style={style}
  />
)

const LOADING_MESSAGES = ["Hang tight.", "Stay put.", "Hold on a sec."]

export type AttendeesListErrorProps = {
  style?: StyleProp<ViewStyle>
}

export const AttendeesListErrorView = ({ style }: AttendeesListErrorProps) => (
  <BaseAttendeesListLoadingView
    title="Uh Oh!"
    possibleMessages={GENERIC_ERROR_MESSAGES}
    style={style}
  />
)

const GENERIC_ERROR_MESSAGES = ["Something went wrong. Please try again."]

type BaseAttendeesListLoadingProps = {
  style?: StyleProp<ViewStyle>
  title: string
  possibleMessages: string[]
}

const BaseAttendeesListLoadingView = ({
  style,
  title,
  possibleMessages
}: BaseAttendeesListLoadingProps) => (
  <View style={[style, styles.container]}>
    <Subtitle style={styles.titleText}>{title}</Subtitle>
    <BodyText style={styles.bodyText}>
      {useMemo(
        () => ArrayUtils.randomElement(possibleMessages),
        [possibleMessages]
      )}
    </BodyText>
  </View>
)

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  titleText: {
    marginVertical: 8,
    textAlign: "center"
  },
  bodyText: {
    opacity: 0.5,
    textAlign: "center"
  }
})
