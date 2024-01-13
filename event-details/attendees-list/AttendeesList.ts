import { useInfiniteQuery } from "@tanstack/react-query"
import { EventAttendee } from "../Event"

type EventAttendeesPage = {
  attendees: EventAttendee[]
  nextPageKey?: string
}

export const useAttendeesList = (
  fetchNextAttendeesPage: (
    eventId: number,
    nextPageKey?: string
  ) => Promise<EventAttendeesPage>,
  eventId: number
) => {
  const infiniteAttendeesQuery = useInfiniteQuery<EventAttendeesPage, Error>({
    queryKey: ["eventAttendees", eventId],
    queryFn: async ({ pageParam }) => {
      return await fetchNextAttendeesPage(eventId, pageParam)
    },
    getNextPageParam: (lastPage) => lastPage.nextPageKey
  })

  return {
    host:
      infiniteAttendeesQuery.data &&
      infiniteAttendeesQuery.data.pages[0].attendees.length > 0
        ? infiniteAttendeesQuery.data.pages[0].attendees[0]
        : undefined,
    attendeeGroups:
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
      : undefined
  }
}
