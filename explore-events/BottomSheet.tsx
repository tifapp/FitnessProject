import { EventCard } from "@event-details/EventCard"
import {
  BottomSheetModal,
  BottomSheetFlatList,
  BottomSheetModalProvider
} from "@gorhom/bottom-sheet"
import { CurrentUserEvent } from "@shared-models/Event"
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

const SNAP_POINTS = ["25%", "50%", "85%"]
const STICKY_HEADER_INDICIES = [0]

/**
 * The bottom sheet that displays events in the explore events view.
 */
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
    <BottomSheetModalProvider>
      <View style={style}>
        <BottomSheetModal
          ref={sheetRef}
          snapPoints={SNAP_POINTS}
          index={1}
          enablePanDownToClose={false}
        >
          <BottomSheetFlatList
            data={events}
            keyExtractor={(event) => event.id.toString()}
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
    </BottomSheetModalProvider>
  )
}

const styles = StyleSheet.create({
  eventContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  event: {
    width: "100%"
  }
})
