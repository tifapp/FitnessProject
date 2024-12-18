import { EventCard } from "@event/EventCard"
import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { ClientSideEvent } from "@event/ClientSideEvent"
import React, { ReactElement } from "react"
import {
  ListRenderItemInfo,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native"
import { TiFBottomSheet, TiFBottomSheetProvider } from "@components/BottomSheet"
import { useCoreNavigation } from "@components/Navigation"

export type ExploreEventsBottomSheetProps = {
  events: ClientSideEvent[]
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
  HeaderComponent,
  EmptyEventsComponent,
  style
}: ExploreEventsBottomSheetProps) => (
  <TiFBottomSheetProvider>
    <View style={style}>
      <TiFBottomSheet
        isPresented
        overlay="on-screen"
        sizing={{ snapPoints: SNAP_POINTS }}
        initialSnapPointIndex={1}
        canSwipeToDismiss={false}
        shouldIncludeBackdrop={false}
      >
        <BottomSheetFlatList
          data={events}
          keyExtractor={(event) => event.id.toString()}
          renderItem={({ item }: ListRenderItemInfo<ClientSideEvent>) => (
            <View style={styles.eventContainer}>
              <EventCard event={item} style={styles.event} />
            </View>
          )}
          ListEmptyComponent={EmptyEventsComponent}
          ListHeaderComponent={HeaderComponent}
          stickyHeaderIndices={STICKY_HEADER_INDICIES}
        />
      </TiFBottomSheet>
    </View>
  </TiFBottomSheetProvider>
)

const styles = StyleSheet.create({
  eventContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  event: {
    width: "100%"
  }
})
