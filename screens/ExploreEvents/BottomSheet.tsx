import { EventCard } from "@components/eventCard/EventCard"
import { BottomSheetModal, BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { CurrentUserEvent } from "@lib/events"
import React, { ReactElement, useEffect, useRef } from "react"
import {
  ListRenderItemInfo,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native"

export type ExploreEventsBottomSheetProps = {
  events: CurrentUserEvent[]
  onEventSelected: (event: CurrentUserEvent) => void
  HeaderComponent: ReactElement
  EmptyEventsComponent: ReactElement
  style?: StyleProp<ViewStyle>
}

const SNAP_POINTS = ["10%", "45%", "80%"]
const STICKY_HEADER_INDICIES = [0]

export const ExploreEventsBottomSheet = ({
  events,
  onEventSelected,
  HeaderComponent,
  EmptyEventsComponent,
  style
}: ExploreEventsBottomSheetProps) => {
  const sheetRef = useRef<BottomSheetModal>(null)

  useEffect(() => {
    sheetRef?.current?.present()
  }, [])

  return (
    <View style={style}>
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={SNAP_POINTS}
        index={1}
        enablePanDownToClose={false}
      >
        <BottomSheetFlatList
          data={events}
          keyExtractor={(event) => event.id}
          renderItem={({ item }: ListRenderItemInfo<CurrentUserEvent>) => (
            <Pressable
              onPress={() => onEventSelected(item)}
              style={styles.eventContainer}
            >
              <EventCard event={item} style={styles.event} />
            </Pressable>
          )}
          ListEmptyComponent={EmptyEventsComponent}
          ListHeaderComponent={HeaderComponent}
          stickyHeaderIndices={STICKY_HEADER_INDICIES}
        />
      </BottomSheetModal>
    </View>
  )
}

const styles = StyleSheet.create({
  eventContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12
  },
  event: {
    width: "100%"
  }
})
