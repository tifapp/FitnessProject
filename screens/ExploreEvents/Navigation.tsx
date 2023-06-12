import React from "react"
import { StackNavigatorType } from "@components/Navigation"
import { Cancellable } from "@lib/Cancellable"
import { CurrentUserEvent } from "@lib/events"
import { LocationCoordinate2D, Region } from "@lib/location"
import { ExploreEventsView } from "./ExploreView"
import { StackScreenProps } from "@react-navigation/stack"
import { createInitialCenter } from "./models"
import { StyleSheet } from "react-native"
import { EventScreensParamsList } from "@screens/EventDetails/EventScreensNavigation"

export type ExploreEventsScreensParamsList = {
  exploreEvents: { searchText: string; center?: LocationCoordinate2D }
  exploreEventsLocationSearch: undefined
  exploreEventsForm: { coordinates: LocationCoordinate2D }
} & EventScreensParamsList

type ExploreEventsProps = StackScreenProps<
  ExploreEventsScreensParamsList,
  "exploreEvents"
>

/**
 * Creates the event exploration screens given a Stack Navigator.
 */
export const createExploreEventsScreens = <
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
  navigation,
  fetchEvents
}: ExploreEventsScreenProps) => (
  <ExploreEventsView
    searchText={route.params.searchText}
    fetchEvents={fetchEvents}
    onEventTapped={(event) => navigation.navigate("Event Details", { event })}
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
