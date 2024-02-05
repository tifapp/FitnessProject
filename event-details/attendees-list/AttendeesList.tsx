import { TiFAPI } from "@api-client/TiFAPI"
import { EventAttendee } from "@shared-models/Event"
import { useInfiniteQuery } from "@tanstack/react-query"

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

export type UseAttendeesListLoadingResult = {
  status: "loading"
  host?: EventAttendee
  attendeePages: EventAttendee[][]
}

export type UseAttendeesListErrorResult = {
  status: "error"
  refresh: () => void
}

export type UseAttendeesListSuccessResult = {
  status: "success"
  host?: EventAttendee
  attendeePages: EventAttendee[][]
  fetchNextGroup?: () => void
  attendeeCount: number
  refresh: () => void
  isRefetchingGroups: boolean
}

export type UseAttendeesListResult =
  | UseAttendeesListErrorResult
  | UseAttendeesListLoadingResult
  | UseAttendeesListSuccessResult

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
      ...infiniteAttendeesQuery,
      host: infiniteAttendeesQuery.data,
      attendeePages: []
    }
  }
  if (infiniteAttendeesQuery.status === "error") {
    return {
      ...infiniteAttendeesQuery,
      refresh: () => infiniteAttendeesQuery.refetch()
    }
  }

  return {
    status: infiniteAttendeesQuery.status,
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
    fetchNextGroup: infiniteAttendeesQuery.hasNextPage
      ? () => {
        infiniteAttendeesQuery.fetchNextPage()
      }
      : undefined,
    attendeeCount:
      infiniteAttendeesQuery.data?.pages[
        infiniteAttendeesQuery.data.pages.length - 1
      ].attendeeCount,
    refresh: () => {
      infiniteAttendeesQuery.refetch()
    },
    isRefetchingGroups: infiniteAttendeesQuery.isRefetching
  }
}
