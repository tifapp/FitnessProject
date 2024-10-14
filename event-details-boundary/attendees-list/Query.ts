import { InfiniteData, QueryClient } from "@tanstack/react-query"
import { EventID } from "TiFShared/domain-models/Event"
import { EventAttendeesPage } from "./AttendeesList"
import { EventAttendeesList } from "./EventAttendeesList"

/**
 * Updates the currently cached {@link AttendeesList}.
 */
export const updateAttendeesListQueryEvent = (
  queryClient: QueryClient,
  id: EventID,
  updateFn: (attendeesList: EventAttendeesList) => EventAttendeesList
) => {
  queryClient.setQueryData(
    ["eventAttendees", id],
    (result: InfiniteData<EventAttendeesPage> | undefined) => {
      if (!result) return result
      const updatedList = updateFn(new EventAttendeesList(result.pages))
      return { ...result, pages: updatedList.pages }
    }
  )
}
