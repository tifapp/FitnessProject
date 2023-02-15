import React, { useEffect, useMemo, useRef, useState } from "react"
import { ListRenderItemInfo, View } from "react-native"
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { Event } from "@lib/events/Event"
import EventItem from "@components/EventItem"
import NearbyActivities from "./headerComponents/NearbyActivities"

const EventsList = () => {
  const [events, setEvents] = useState<Event[]>([])

  // hooks
  const sheetRef = useRef<BottomSheet>(null)

  // variables
  const snapPoints = useMemo(() => ["4%", "65%"], [])

  const date = new Date()
  date.setHours(date.getHours() + 15)

  useEffect(() => {
    const test = []
    for (let i = 0; i < 9; i++) {
      const event: Event = {
        id: String(i),
        userId: "3234324",
        repliesCount: 2,
        writtenByYou: true,
        startTime: date,
        maxOccupancy: 5,
        hasInvitations: true,
        color: "magenta",
        title: "Title for Event",
        distance: 0.5
      }
      test.push(event)
    }
    setEvents(test)
  }, [])

  return (
    <View style={{ flex: 1 }}>
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        index={0}
        handleHeight={15}
      >
        <BottomSheetFlatList
          data={events}
          renderItem={({ item }: ListRenderItemInfo<Event>) => (
            <EventItem event={item} />
          )}
          ListHeaderComponent={<NearbyActivities />}
          stickyHeaderIndices={[0]}
        />
      </BottomSheet>
    </View>
  )
}

export default EventsList
