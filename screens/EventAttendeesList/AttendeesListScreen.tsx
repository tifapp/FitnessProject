import { Title } from "@components/Text"
import ConfirmationDialogue from "@components/profileImageComponents/ConfirmationDialogue"
import { EventAttendee } from "@lib/events"
import { uuid } from "@lib/uuid"
import { AttendeeEntry } from "@screens/EventAttendeesList/attendeeEntry"
import React from "react"
import { FlatList, View } from "react-native"

const namesAndHandles = [
  { name: "Sophia Wilson", handle: "sophisophia" },
  { name: "Benjamin Clark", handle: "benjamincred" },
  { name: "Ava Thompson", handle: "avantgardeava" },
  { name: "Elijah Rodriguez", handle: "electricelijah" },
  { name: "Mia Anderson", handle: "mysticalmia" },
  { name: "James Martinez", handle: "jovialjames" },
  { name: "Isabella Scott", handle: "bellaenchant" },
  { name: "William Cooper", handle: "wittywilliam" },
  { name: "Charlotte Taylor", handle: "charismaticchar" },
  { name: "Ethan Adams", handle: "energeticethan" },
  { name: "Amelia Mitchell", handle: "amiableamelia" },
  { name: "Oliver Wright", handle: "outspokenoliver" },
  { name: "Harper Turner", handle: "harmaciousharp" },
  { name: "Elijah Walker", handle: "etherealelijah" },
  { name: "Evelyn Green", handle: "evergreenevelyn" },
  { name: "Henry Hill", handle: "happyhenry" },
  { name: "Elizabeth Phillips", handle: "luminouslizzy" },
  { name: "Michael Campbell", handle: "musicalmichael" },
  { name: "Sofía Bailey", handle: "sparklingsofía" },
  { name: "Alexander Reed", handle: "artisticalex" }
]

const someData: EventAttendee[] = namesAndHandles.map(({ name, handle }) => ({
  id: uuid(),
  username: name,
  handle: "@" + handle
}))

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
