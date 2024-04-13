import { TiFAPI } from "@api-client/TiFAPI"
import { EventAttendee } from "@shared-models/Event"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { StyleProp, ViewStyle } from "react-native"
import { EventAttendeesList } from "./EventAttendeesList"

export type EventAttendeesPage = {
  attendees: EventAttendee[]
  totalAttendeeCount: number
  nextPageCursor: string | null
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
  nextPageCursor?: string
): Promise<EventAttendeesLoadingResult> => {
  const resp = await tifAPI.attendeesList(eventId, pageSize, nextPageCursor)
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
        ...resp.data,
        totalAttendeeCount: 0
      }
    }
  }
}

export type UseAttendeesListResult =
  | { status: "error"; refresh: () => void }
  | { status: "loading" }
  | {
      status: "success"
      fetchNextGroup?: () => void
      attendeesList: EventAttendeesList
      refresh: () => void
      isRefetching: boolean
      isFetchingNextPage: boolean
    }

export type UseAttendeesListProps = {
  fetchNextAttendeesPage: (
    eventId: number,
    pageSize: number,
    nextPageCursor?: string
  ) => Promise<EventAttendeesPage>
  eventId: number
  pageSize: number
}

export const useAttendeesList = ({
  fetchNextAttendeesPage,
  eventId,
  pageSize
}: UseAttendeesListProps): UseAttendeesListResult => {
  const infiniteAttendeesQuery = useInfiniteQuery({
    queryKey: ["eventAttendees", eventId],
    queryFn: async ({ pageParam }) => {
      return await fetchNextAttendeesPage(eventId, pageSize, pageParam)
    },
    getNextPageParam: (lastPage) => lastPage.nextPageCursor
  })
  const attendeesList = useMemo(
    () => new EventAttendeesList(infiniteAttendeesQuery.data?.pages ?? []),
    [infiniteAttendeesQuery.data?.pages]
  )
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

  const fetchNextGroup = () => {
    infiniteAttendeesQuery.fetchNextPage()
  }

  return {
    ...infiniteAttendeesQuery,
    attendeesList,
    fetchNextGroup: infiniteAttendeesQuery.hasNextPage
      ? fetchNextGroup
      : undefined,
    refresh: () => {
      infiniteAttendeesQuery.refetch()
    }
  }
}

export type AttendeesListViewProps = {
  renderAttendee: (eventAttendee: EventAttendee) => JSX.Element
  ListHeaderComponent?: JSX.Element
  style?: StyleProp<ViewStyle>
} & Omit<
  Extract<ReturnType<typeof useAttendeesList>, { status: "success" }>,
  "status" | "host" | "isFetchingNextPage"
>
