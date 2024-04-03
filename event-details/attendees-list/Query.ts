import { EventID } from "@shared-models/Event"
import { eventAttendeesListQueryKey } from "@shared-models/query-keys/Event"
import { InfiniteData, QueryClient } from "@tanstack/react-query"
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
    eventAttendeesListQueryKey(id),
    (result: InfiniteData<EventAttendeesPage> | undefined) => {
      if (!result) return result
      return updateFn(result)
    }
  )
}
