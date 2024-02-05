import { Headline } from "@components/Text"
import { EventAttendee } from "@shared-models/Event"
import React from "react"
import { FlatList, StyleProp, View, ViewStyle } from "react-native"
import { useAttendeesList } from "./AttendeesList"

export type AttendeesListHostViewProps = {
  renderHost: (host: EventAttendee) => JSX.Element
  ListHeaderComponent?: JSX.Element
  style?: StyleProp<ViewStyle>
} & Extract<ReturnType<typeof useAttendeesList>, { status: "success" }>

export const AttendeesListHostView = ({
  host,
  renderHost,
  ListHeaderComponent,
  style
}: AttendeesListHostViewProps) => {
  return (
    <View>
      <View>
        <FlatList
          contentContainerStyle={style}
          ListHeaderComponent={
            <View>
              {ListHeaderComponent}
              <View>
                <Headline> Host </Headline>
              </View>
            </View>
          }
          data={[host]}
          keyExtractor={(item) => `attendee-${item?.id}`}
          renderItem={({ item }) => (item ? renderHost(item) : <View></View>)}
        />
      </View>
    </View>
  )
}
