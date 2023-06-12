import React from "react"
import { StackNavigatorType } from "@components/Navigation"
import { Cancellable } from "@lib/Cancellable"
import { CurrentUserEvent } from "@lib/events"
import { LocationCoordinate2D, Region } from "@lib/location"
import { ExploreEventsView } from "./ExploreView"
import { StackScreenProps } from "@react-navigation/stack"
import { createInitialCenter } from "./models"
import { StyleSheet } from "react-native"

export type ExploreEventsScreensParamsList = {
  exploreEvents: { searchText: string; center?: LocationCoordinate2D }
  exploreEventsLocationSearch: undefined
}

type ExploreEventsProps = StackScreenProps<
  ExploreEventsScreensParamsList,
  "exploreEvents"
>

export const createExploreEventsScreensStack = <
  ParamsList extends ExploreEventsScreensParamsList
>(
    stack: StackNavigatorType<ParamsList>,
    fetchEvents: (region: Region) => Cancellable<CurrentUserEvent[]>
  ) => (
    <>
      <stack.Screen
        name="exploreEvents"
        options={{ headerShown: false }}
        initialParams={{}}
      >
        {(props: ExploreEventsProps) => (
          <ExploreEventsScreen {...props} fetchEvents={fetchEvents} />
        )}
      </stack.Screen>
      {/* TODO: - Add Location Search Route */}
    </>
  )

type ExploreEventsScreenProps = {
  fetchEvents: (region: Region) => Cancellable<CurrentUserEvent[]>
} & ExploreEventsProps

const ExploreEventsScreen = ({
  route,
  fetchEvents
}: ExploreEventsScreenProps) => (
  <ExploreEventsView
    searchText={route.params.searchText}
    fetchEvents={fetchEvents}
    onEventTapped={console.log}
    onMapLongPress={console.log}
    onSearchTapped={() => console.log("Search")}
    initialCenter={createInitialCenter(route.params.center)}
    style={styles.exploreEvents}
  />
)

const styles = StyleSheet.create({
  exploreEvents: {
    width: "100%",
    height: "100%"
  }
})
