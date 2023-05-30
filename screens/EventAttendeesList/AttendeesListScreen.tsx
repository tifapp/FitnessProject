import { Title } from "@components/Text"
import ConfirmationDialogue from "@components/profileImageComponents/ConfirmationDialogue"
import { delayData } from "@lib/DelayData"
import { AttendeeEntry } from "@screens/EventAttendeesList/attendeeEntry"
import React from "react"
import { FlatList, View } from "react-native"
import { useQuery } from "react-query"
import { AttendeeListMocks } from "./AttendeesMocks"

export const AttendeesListScreen = () => {
  const someQuery = useQuery(["/event/:eventId/attendee", "GET"], () =>
    delayData(AttendeeListMocks.List1)
  )

  const someData = someQuery.data ?? []
  // List of attendees

  const FlatSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "100%"
        }}
      />
    )
  }

  return (
    <View style={{ flex: 1, marginTop: 24, marginHorizontal: 16 }}>
      <Title style={{ marginTop: 8 }}>Attendees List</Title>
      <FlatList
        ItemSeparatorComponent={FlatSeparator}
        data={someData}
        renderItem={({ item }) => (
          <>
            <View style={{ flex: 1, flexDirection: "row", marginTop: 8 }}>
              <AttendeeEntry attendee={item} />
              <ConfirmationDialogue
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignSelf: "center",
                  justifyContent: "flex-end"
                }}
              />
            </View>
          </>
        )}
      />
    </View>
  )
}
