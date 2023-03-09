import React, { useEffect, useRef } from "react"
import { ListRenderItemInfo, View } from "react-native"
import {
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetModalProvider
} from "@gorhom/bottom-sheet"
import { Event } from "@lib/events/Event"
import EventItem from "@components/EventItem"
import NearbyActivities from "./headerComponents/NearbyActivities"
import { eventsDependencyKey } from "@lib/events/Events"
import { useDependencyValue } from "@lib/dependencies"

const EventsList = () => {
  const eventItems = useDependencyValue(eventsDependencyKey)
  const ids = Array.from(new Array(4), (_, i) => String(i))
  const events = eventItems.eventsWithIds(ids)
  const MARGIN_HORIZONTAL = 16
  const MARGIN_VERTICAL = 16

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
              <View
                style={{
                  marginHorizontal: MARGIN_HORIZONTAL,
                  marginVertical: MARGIN_VERTICAL
                }}
              >
                <EventItem event={item} />
              </View>
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
