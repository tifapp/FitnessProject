import { TiFFormCardView } from "@components/form-components/Card"
import { TiFFormSectionView } from "@components/form-components/Section"
import ProfileImageAndName from "@components/profileImageComponents/ProfileImageAndName"
import { CaptionTitle, Headline } from "@components/Text"
import {
  updateEventDetailsQueryEvent,
  useLoadEventDetails
} from "@event/DetailsQuery"
import { AppStyles } from "@lib/AppColorStyle"
import { useQueryClient } from "@tanstack/react-query"
import { FriendRequestButton, useFriendRequest } from "@user/FriendRequest"
import dayjs from "dayjs"
import { memo, useEffect } from "react"
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native"
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from "react-native-reanimated"
import { useCoreNavigation } from "@components/Navigation"
import { EventAttendee, EventID } from "TiFShared/domain-models/Event"
import {
  UnblockedUserRelationsStatus,
  UserID
} from "TiFShared/domain-models/User"
import { EventDetailsContentView, NoContentView } from "./Content"

export type UseEventAttendeesListEnvironment = {
  eventId: EventID
}

export const useEventAttendeesList = ({
  eventId
}: UseEventAttendeesListEnvironment) => {
  const details = useLoadEventDetails(eventId)
  const queryClient = useQueryClient()
  if (details.status !== "success") {
    return details
  }
  return {
    ...details,
    attendees: details.event.previewAttendees.slice(1),
    host: details.event.previewAttendees[0],
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
  style?: StyleProp<ViewStyle>
}

export const EventAttendeesListView = ({
  state,
  onExploreOtherEventsTapped,
  style
}: EventAttendeesListProps) => (
  <View style={style}>
    <EventDetailsContentView
      result={state}
      onExploreOtherEventsTapped={onExploreOtherEventsTapped}
      style={styles.list}
    >
      {(state) => (
        <FlatList
          keyExtractor={(a) => a.id}
          data={state.attendees}
          renderItem={({ item }) => (
            <EventAttendeeCardView
              attendee={item}
              style={styles.attendeeListItemContainer}
              onRelationStatusChanged={state.relationStatusChanged}
            />
          )}
          ListHeaderComponent={
            <View style={styles.headerSections}>
              <TiFFormSectionView title="Host">
                <EventAttendeeView
                  attendee={state.host}
                  onRelationStatusChanged={state.relationStatusChanged}
                  size="large"
                />
              </TiFFormSectionView>
              <Headline style={styles.attendeesHeaderTitle}>
                Attendees ({state.attendees.length})
              </Headline>
            </View>
          }
          ListEmptyComponent={
            <NoContentView possibleMessages={NO_ATTENDEES_MESSAGES} />
          }
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          refreshControl={
            <RefreshControl
              refreshing={state.refreshStatus === "pending"}
              onRefresh={state.refresh}
            />
          }
        />
      )}
    </EventDetailsContentView>
  </View>
)

const NO_ATTENDEES_MESSAGES = [
  {
    title: "It's Lonely Here...",
    message: "It seems that we need to get some friends here!"
  },
  {
    title: "It's Lonely Here...",
    message: "Shall we get some of your friends in here?"
  },
  {
    title: "It's Lonely Here...",
    message: "Try getting some friends to join!"
  }
]

export type EventAttendeeProps = {
  attendee: Pick<
    EventAttendee,
    | "name"
    | "handle"
    | "id"
    | "arrivedDateTime"
    | "relationStatus"
    | "profileImageURL"
  >
  size?: "normal" | "large"
  onRelationStatusChanged: (
    id: UserID,
    status: UnblockedUserRelationsStatus
  ) => void
  style?: StyleProp<ViewStyle>
}

export const EventAttendeeCardView = memo(function AttendeeItemView(
  props: EventAttendeeProps
) {
  return (
    <TiFFormCardView style={props.style}>
      <EventAttendeeView {...props} style={styles.atendeeCardContainer} />
    </TiFFormCardView>
  )
})

export const EventAttendeeView = ({
  attendee,
  onRelationStatusChanged,
  size = "normal",
  style
}: EventAttendeeProps) => {
  const state = useFriendRequest({
    user: attendee,
    onSuccess: (status) => onRelationStatusChanged(attendee.id, status)
  })
  const { presentProfile } = useCoreNavigation()
  return (
    <View style={style}>
      <View style={styles.attendeeContainer}>
        <View style={styles.attendeeCardRow}>
          <View style={styles.attendeeProfileAndName}>
            <Pressable onPress={() => presentProfile(attendee.id)}>
              <ProfileImageAndName
                name={attendee.name}
                handle={attendee.handle}
                imageURL={attendee.profileImageURL ?? null}
                size={size}
              />
            </Pressable>
          </View>
          <FriendRequestButton state={state} size={size} />
        </View>
        {attendee.arrivedDateTime && (
          <ArrivedAtTextView date={attendee.arrivedDateTime} size={size} />
        )}
      </View>
    </View>
  )
}

type ArrivedAtTextProps = {
  date: Date
  size: "normal" | "large"
}

const ArrivedAtTextView = ({ date, size }: ArrivedAtTextProps) => {
  const progress = useSharedValue(0)
  const green = AppStyles.green.toString()
  const emerald = AppStyles.emerald.toString()
  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 2000 }), -1, true)
  }, [progress])
  return (
    <View
      style={[styles.arrivedAtRow, { marginLeft: size === "normal" ? 8 : 16 }]}
    >
      <Animated.View
        style={[
          styles.arrivedCircle,
          useAnimatedStyle(() => ({
            backgroundColor: interpolateColor(
              progress.value,
              [0, 1],
              [green, emerald]
            )
          }))
        ]}
      />
      <CaptionTitle
        style={useAnimatedStyle(() => ({
          color: interpolateColor(progress.value, [0, 1], [green, emerald])
        }))}
      >
        Arrived at {dayjs(date).format("h:mm:ss A")}
      </CaptionTitle>
    </View>
  )
}

const styles = StyleSheet.create({
  list: {
    height: "100%"
  },
  attendeesHeaderTitle: {
    marginBottom: 16
  },
  headerSections: {
    rowGap: 24,
    paddingHorizontal: 24
  },
  attendeeListItemContainer: {
    paddingHorizontal: 24
  },
  attendeeContainer: {
    rowGap: 8
  },
  atendeeCardContainer: {
    padding: 16,
    rowGap: 16
  },
  attendeeCardRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 8
  },
  arrivedAtRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8
  },
  attendeeProfileAndName: {
    flex: 1
  },
  friendButtonRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8
  },
  friendButtonText: {
    color: "white"
  },
  arrivedCircle: {
    width: 8,
    height: 8,
    borderRadius: 128
  },
  arrivedText: {
    color: AppStyles.emerald.toString()
  },
  friendButton: {
    padding: 8
  },
  itemSeparator: {
    padding: 8
  }
})
