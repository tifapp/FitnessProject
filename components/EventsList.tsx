import React, { useEffect, useRef } from "react"
import { ListRenderItemInfo, StyleSheet, Text, View } from "react-native"
import {
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetModalProvider
} from "@gorhom/bottom-sheet"
import { Event } from "@lib/events/Event"
import EventItem from "@components/EventItem"
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
  const snapPoints = ["3%", "65%", "100%"]

  return (
    <BottomSheetModalProvider>
      <View
        style={{
          flex: 1
        }}
      >
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
            ListHeaderComponent={
              <Text style={styles.activitiesText}>Nearby Activities</Text>
            }
            stickyHeaderIndices={[0]}
          />
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  )
}

const styles = StyleSheet.create({
  activitiesText: {
    fontSize: 20,
    marginLeft: 16,
    textAlignVertical: "top",
    fontWeight: "bold"
  }
})

export default EventsList
