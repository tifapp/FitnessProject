import { useQuery } from "@tanstack/react-query"
import { UserID } from "TiFShared/domain-models/User"
import { UserProfileFeature } from "./Context"
import { userProfileQueryKey } from "./QueryKey"

export type UseUpcomingEventsEnvironment = {
  userId: UserID
}

export const useUpcomingEvents = ({ userId }: UseUpcomingEventsEnvironment) => {
  const { fetchUpcomingEvents } = UserProfileFeature.useContext()
  const query = useQuery({
    queryKey: userProfileQueryKey(userId, ["events"]),
    queryFn: async () => await fetchUpcomingEvents(userId)
  })
  return query
}
