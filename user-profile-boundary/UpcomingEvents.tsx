import {
  ClientSideEvent,
  clientSideEventFromResponse
} from "@event/ClientSideEvent"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { TiFAPI } from "TiFShared/api"
import { UserID } from "TiFShared/domain-models/User"
import { UserProfileFeature, userProfileQueryKey } from "./UserProfile"

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
  userId: UserID
}

export const useUpcomingEvents = ({ userId }: UseUpcomingEventsEnvironment) => {
  const { fetchUpcomingEvents } = UserProfileFeature.useContext()
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: userProfileQueryKey(userId, ["events"]),
    queryFn: async () => await fetchUpcomingEvents(userId)
  })
  return query
}
