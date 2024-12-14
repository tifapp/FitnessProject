import { Subtitle } from "@components/Text"
import {
  ClientSideEvent,
  clientSideEventFromResponse
} from "@event/ClientSideEvent"
import { EventCard } from "@event/EventCard"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { FlatList, StyleProp, View, ViewStyle } from "react-native"
import { TiFAPI } from "TiFShared/api"
import { UserID } from "TiFShared/domain-models/User"
import { userProfileQueryKey } from "./UserProfile"

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
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: userProfileQueryKey(userId, ["events"]),
    queryFn: async () => await fetchUpcomingEvents(userId)
  })
  return query
}

export type BaseUpcomingEventsProps = {
  events: ClientSideEvent[]
  style?: StyleProp<ViewStyle>
}

export const BaseUpcomingEventsView = ({
  events,
  style
}: BaseUpcomingEventsProps) => {
  return (
    <View style={style}>
      <Subtitle>{"Upcoming Events"}</Subtitle>
      <FlatList
        data={events}
        renderItem={(e) => (
          <View style={{ paddingBottom: 16 }}>
            <EventCard event={e.item} />
          </View>
        )}
      />
    </View>
  )
}
