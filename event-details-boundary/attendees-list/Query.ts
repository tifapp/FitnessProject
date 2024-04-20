import { InfiniteData, QueryClient } from "@tanstack/react-query"
import { EventID } from "TiFShared/domain-models/Event"
import { EventAttendeesPage } from "./AttendeesList"

/**
 * Updates the currently cached {@link AttendeesList}.
 */
export const updateAttendeesListQueryEvent = (
  queryClient: QueryClient,
  id: EventID,
  updateFn: (
    attendeesList: InfiniteData<EventAttendeesPage>
  ) => InfiniteData<EventAttendeesPage>
) => {
  queryClient.setQueryData(
    ["eventAttendees", id],
    (result: InfiniteData<EventAttendeesPage> | undefined) => {
      if (!result) return result
      return updateFn(result)
    }
  )
}
