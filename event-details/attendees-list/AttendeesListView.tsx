import { Headline } from "@components/Text"
import { EventAttendee } from "@shared-models/Event"
import React from "react"
import { FlatList, StyleProp, View, ViewStyle } from "react-native"
import { useAttendeesList } from "./AttendeesList"

export type AttendeesListViewProps = {
  renderAttendee: (eventAttendee: EventAttendee) => JSX.Element
  ListHeaderComponent?: JSX.Element
  style?: StyleProp<ViewStyle>
} & Extract<ReturnType<typeof useAttendeesList>, { status: "success" }>

export const AttendeesListView = ({
  attendeePages,
  attendeeCount,
  isRefetchingGroups,
  renderAttendee,
  refresh,
  fetchNextGroup,
  ListHeaderComponent,
  style
}: AttendeesListViewProps) => {
  return (
    <View>
      <View>
        <FlatList
          contentContainerStyle={style}
          refreshing={isRefetchingGroups}
          ListHeaderComponent={
            <View>
              {ListHeaderComponent}
              <View>
                <Headline> Attendees </Headline>
                <Headline> ({attendeeCount})</Headline>
              </View>
            </View>
          }
          data={attendeePages.flat()}
          onRefresh={refresh}
          keyExtractor={(item) => `attendee-${item.id}`}
          renderItem={({ item }) => renderAttendee(item)}
          onEndReached={fetchNextGroup}
        />
      </View>
    </View>
  )
}
