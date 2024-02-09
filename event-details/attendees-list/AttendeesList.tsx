import { TiFAPI } from "@api-client/TiFAPI"
import { Headline } from "@components/Text"
import { EventAttendee } from "@shared-models/Event"
import { useInfiniteQuery } from "@tanstack/react-query"
import React from "react"
import { FlatList, StyleProp, View, ViewStyle } from "react-native"

export type EventAttendeesPage = {
  attendees: EventAttendee[]
  totalAttendeeCount: number
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

export type UseAttendeesListResult =
  | { status: "error"; refresh: () => void }
  | { status: "loading" }
  | {
      status: "success"
      host: EventAttendee
      attendees: EventAttendee[]
      fetchNextGroup?: () => void
      totalAttendeeCount: number
      refresh: () => void
      isRefetching: boolean
      isFetchingNextPage: boolean
    }

export const useAttendeesList = (
  fetchNextAttendeesPage: (
    eventId: number,
    pageSize: number,
    nextPageKey?: string
  ) => Promise<EventAttendeesPage>,
  eventId: number,
  pageSize: number
): UseAttendeesListResult => {
  const infiniteAttendeesQuery = useInfiniteQuery<EventAttendeesPage, Error>({
    queryKey: ["eventAttendees", eventId],
    queryFn: async ({ pageParam }) => {
      return await fetchNextAttendeesPage(eventId, pageSize, pageParam)
    },
    getNextPageParam: (lastPage) => lastPage.nextPageKey
  })
  if (infiniteAttendeesQuery.status === "loading") {
    return {
      status: "loading"
    }
  }
  if (infiniteAttendeesQuery.status === "error") {
    return {
      status: "error",
      refresh: () => {
        infiniteAttendeesQuery.refetch()
      }
    }
  }

  return {
    ...infiniteAttendeesQuery,
    host: infiniteAttendeesQuery.data.pages[0].attendees[0],
    attendees:
      infiniteAttendeesQuery.data?.pages
        .map((page, index) => {
          if (index === 0) return page.attendees.slice(1)
          return page.attendees
        })
        .flat() ?? [],
    fetchNextGroup: infiniteAttendeesQuery.hasNextPage
      ? () => {
        infiniteAttendeesQuery.fetchNextPage()
      }
      : undefined,
    totalAttendeeCount:
      infiniteAttendeesQuery.data?.pages[
        infiniteAttendeesQuery.data.pages.length - 1
      ].totalAttendeeCount,
    refresh: () => {
      infiniteAttendeesQuery.refetch()
    }
  }
}

export type AttendeesListViewProps = {
  renderAttendee: (eventAttendee: EventAttendee) => JSX.Element
  ListHeaderComponent?: JSX.Element
  style?: StyleProp<ViewStyle>
} & Extract<ReturnType<typeof useAttendeesList>, { status: "success" }>

export const AttendeesListView = ({
  attendees,
  totalAttendeeCount,
  isRefetching,
  renderAttendee,
  refresh,
  fetchNextGroup,
  ListHeaderComponent,
  style
}: AttendeesListViewProps) => {
  return (
    <FlatList
      style={style}
      refreshing={isRefetching}
      ListHeaderComponent={
        <View>
          {ListHeaderComponent}
          <View>
            <Headline> Attendees </Headline>
            <Headline> ({totalAttendeeCount})</Headline>
          </View>
        </View>
      }
      data={attendees}
      onRefresh={refresh}
      keyExtractor={(item) => `attendee-${item.id}`}
      renderItem={({ item }) => renderAttendee(item)}
      onEndReached={fetchNextGroup}
    />
  )
}
