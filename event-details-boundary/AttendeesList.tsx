import {
  EventDetailsLoadingResult,
  updateEventDetailsQueryEvent
} from "@event/DetailsQuery"
import { EventAttendee, EventID } from "TiFShared/domain-models/Event"
import { EventDetailsView, useLoadEventDetails } from "./Details"
import {
  UnblockedUserRelationsStatus,
  UserID
} from "TiFShared/domain-models/User"
import { useQueryClient } from "@tanstack/react-query"
import {
  StyleProp,
  ViewStyle,
  StyleSheet,
  View,
  Pressable,
  FlatList,
  RefreshControl
} from "react-native"
import { TiFFormCardView } from "@components/form-components/Card"
import ProfileImageAndName from "@components/profileImageComponents/ProfileImageAndName"
import { memo } from "react"
import { useFriendRequest } from "@user/FriendRequest"

export type UseEventAttendeesListEnvironment = {
  event: (id: EventID) => Promise<EventDetailsLoadingResult>
  eventId: EventID
}

export const useEventAttendeesList = ({
  eventId,
  event
}: UseEventAttendeesListEnvironment) => {
  const details = useLoadEventDetails(eventId, event)
  const queryClient = useQueryClient()
  if (details.status !== "success") {
    return details
  }
  return {
    ...details,
    attendees: details.event.previewAttendees,
    relationStatusChanged: (
      id: UserID,
      status: UnblockedUserRelationsStatus
    ) => {
      updateEventDetailsQueryEvent(queryClient, eventId, (event) => {
        const index = event.previewAttendees.findIndex((a) => a.id === id)
        const attendee = {
          ...event.previewAttendees[index],
          relationStatus: status
        }
        return {
          ...event,
          previewAttendees: event.previewAttendees.with(index, attendee)
        }
      })
    }
  }
}

export type EventAttendeesListProps = {
  state: ReturnType<typeof useEventAttendeesList>
  onExploreOtherEventsTapped: () => void
  onProfileTapped: (id: UserID) => void
  style?: StyleProp<ViewStyle>
}

export const EventAttendeesListView = ({
  state,
  onExploreOtherEventsTapped,
  onProfileTapped,
  style
}: EventAttendeesListProps) => (
  <View style={style}>
    <EventDetailsView
      result={state}
      onExploreOtherEventsTapped={onExploreOtherEventsTapped}
      style={styles.list}
    >
      {(state) => (
        <FlatList
          keyExtractor={(a) => a.id}
          data={state.attendees}
          renderItem={({ item }) => (
            <AttendeeView
              attendee={item}
              onProfileTapped={onProfileTapped}
              onRelationStatusChanged={state.relationStatusChanged}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          refreshControl={
            <RefreshControl
              refreshing={state.refreshStatus === "loading"}
              onRefresh={state.refresh}
            />
          }
        />
      )}
    </EventDetailsView>
  </View>
)

type AttendeeProps = {
  attendee: EventAttendee
  onProfileTapped: (id: UserID) => void
  onRelationStatusChanged: (
    id: UserID,
    status: UnblockedUserRelationsStatus
  ) => void
}

const AttendeeView = memo(function AttendeeView({
  attendee,
  onRelationStatusChanged,
  onProfileTapped
}: AttendeeProps) {
  // const state = useFriendRequest({ user: attendee, onSuccess: (status) => onRelationStatusChanged(attendee.id, status) })
  return (
    <TiFFormCardView style={styles.attendeeContainer}>
      <View style={styles.atendeeCardContainer}>
        <View style={styles.attendeeProfileAndName}>
          <Pressable onPress={() => onProfileTapped(attendee.id)}>
            <ProfileImageAndName
              name={attendee.name}
              handle={attendee.handle}
              imageURL={attendee.profileImageURL ?? null}
            />
          </Pressable>
        </View>
      </View>
    </TiFFormCardView>
  )
})

const styles = StyleSheet.create({
  list: {
    height: "100%"
  },
  attendeeContainer: {
    paddingHorizontal: 24
  },
  atendeeCardContainer: {
    padding: 16,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 8
  },
  attendeeProfileAndName: {
    flex: 1
  },
  itemSeparator: {
    padding: 8
  }
})
