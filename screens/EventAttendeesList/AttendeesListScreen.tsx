import { Title } from "@components/Text"
import ConfirmationDialogue from "@components/profileImageComponents/ConfirmationDialogue"
import { EventAttendee } from "@lib/events"
import { AttendeeEntry } from "@screens/EventAttendeesList/attendeeEntry"
import React from "react"
import { FlatList, View } from "react-native"

const someData: EventAttendee[] = [
  {
    id: "1",
    username: "Cool",
    handle: "Cool"
  },
  {
    id: "2",
    username: "Also cool",
    handle: "Cool"
  },
  {
    id: "3",
    username: "Also coolest",
    handle: "Cool"
  },
  {
    id: "4",
    username: "Also coolest",
    handle: "Cool"
  },
  {
    id: "5",
    username: "Also coolest",
    handle: "Cool"
  },
  {
    id: "6",
    username: "Also coolest",
    handle: "Cool"
  },
  {
    id: "7",
    username: "Also coolest",
    handle: "Cool"
  },
  {
    id: "8",
    username: "Also coolest",
    handle: "Cool"
  },
  {
    id: "9",
    username: "Also coolest",
    handle: "Cool"
  },
  {
    id: "10",
    username: "Also coolest",
    handle: "Cool"
  },
  {
    id: "11",
    username: "Also coolest",
    handle: "Cool"
  }
]

export const AttendeesListScreen = () => {
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
