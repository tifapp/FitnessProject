import { EventCard } from "@event/EventCard"
import {
  BottomSheetFlatList,
  BottomSheetHandle,
  BottomSheetHandleProps
} from "@gorhom/bottom-sheet"
import { ClientSideEvent } from "@event/ClientSideEvent"
import React, { ReactElement, useCallback } from "react"
import {
  ListRenderItemInfo,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native"
import { TiFBottomSheet } from "@components/BottomSheet"

export type ExploreEventsBottomSheetProps = {
  events: ClientSideEvent[]
  HeaderComponent: () => JSX.Element
  EmptyEventsComponent: ReactElement
  style?: StyleProp<ViewStyle>
}

const SNAP_POINTS = ["25%", "50%", "85%"]

/**
 * The bottom sheet that displays events in the explore events view.
 */
export const ExploreEventsBottomSheet = ({
  events,
  HeaderComponent,
  EmptyEventsComponent,
  style
}: ExploreEventsBottomSheetProps) => (
  <TiFBottomSheet
    isTerminallyPresented
    overlay="on-screen"
    sizing={{ snapPoints: SNAP_POINTS }}
    initialSnapPointIndex={1}
    HandleView={useCallback(
      (props: BottomSheetHandleProps) => (
        <View style={styles.handle}>
          <BottomSheetHandle {...props} />
          <HeaderComponent />
        </View>
      ),
      [HeaderComponent]
    )}
    canSwipeToDismiss={false}
    shouldIncludeBackdrop={false}
    style={style}
  >
    <BottomSheetFlatList
      data={events}
      keyExtractor={(event) => event.id.toString()}
      renderItem={({ item }: ListRenderItemInfo<ClientSideEvent>) => (
        <EventCard event={item} style={styles.event} />
      )}
      ListEmptyComponent={EmptyEventsComponent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      contentContainerStyle={{
        paddingBottom: Platform.OS === "ios" ? 16 : 104
      }}
      contentInset={{ bottom: 104 }}
    />
  </TiFBottomSheet>
)

const styles = StyleSheet.create({
  separator: {
    height: 16
  },
  handle: {
    rowGap: 8
  },
  event: {
    width: "100%",
    paddingHorizontal: 24
  }
})
