import {
  ClientSideEvent,
  clientSideEventFromResponse
} from "@event/ClientSideEvent"
import { useQuery } from "@tanstack/react-query"
import { TiFAPI } from "TiFShared/api"
import { UserID } from "TiFShared/domain-models/User"
import { userProfileQueryKey } from "./QueryKey"

export type UpcomingEventsResult =
  | {
      status: "success"
      events: ClientSideEvent[]
    }
  | { status: "blocked-you" | "user-not-found" }

export const userUpcomingEvents = async (
  userID: UserID,
  api: TiFAPI = TiFAPI.productionInstance
): Promise<UpcomingEventsResult> => {
  const resp = await api.upcomingEvents({ query: { userId: userID } })
  if (resp.status === 200) {
    return {
      status: "success",
      events: resp.data.events.map(clientSideEventFromResponse)
    }
  }
  return { status: resp.data.error }
}

export type UseUpcomingEventsEnvironment = {
  fetchUpcomingEvents: (userId: UserID) => Promise<UpcomingEventsResult>
  userId: UserID
}

export const useUpcomingEvents = ({
  fetchUpcomingEvents,
  userId
}: UseUpcomingEventsEnvironment) => {
  const query = useQuery({
    queryKey: userProfileQueryKey(userId, ["events"]),
    queryFn: async () => await fetchUpcomingEvents(userId)
  })
  return query
}
