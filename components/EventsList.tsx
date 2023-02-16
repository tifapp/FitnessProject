import React, { useEffect, useRef, useState } from "react"
import { ListRenderItemInfo, View } from "react-native"
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetModalProvider
} from "@gorhom/bottom-sheet"
import { Event } from "@lib/events/Event"
import EventItem from "@components/EventItem"
import NearbyActivities from "./headerComponents/NearbyActivities"
import { Events, GraphQLEventItems } from "@lib/events/Events"

let eventItems: Events

const EventsList = () => {
  eventItems = new GraphQLEventItems()
  const ids = Array.from(new Array(10), (_, i) => String(i))
  const events = eventItems.eventsWithIds(ids)

  // hooks
  const sheetRef = useRef<BottomSheetModal>(null)

  useEffect(() => {
    sheetRef?.current?.present()
  }, [])

  // variables
  const snapPoints = ["4%", "65%", "100%"]

  return (
    <BottomSheetModalProvider>
      <View style={{ flex: 1 }}>
        <BottomSheetModal
          ref={sheetRef}
          snapPoints={snapPoints}
          index={0}
          enablePanDownToClose={false}
        >
          <BottomSheetFlatList
            data={events}
            renderItem={({ item }: ListRenderItemInfo<Event>) => (
              <EventItem event={item} />
            )}
            ListHeaderComponent={<NearbyActivities />}
            stickyHeaderIndices={[0]}
          />
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  )
}

export default EventsList
