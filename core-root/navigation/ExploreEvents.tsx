import { StackNavigatorType } from "@components/Navigation"
import { Region, isSignificantlyDifferentRegions } from "@location/index"
import { StackScreenProps } from "@react-navigation/stack"
import { CurrentUserEvent } from "@shared-models/Event"
import React from "react"
import { StyleSheet } from "react-native"
import {
  useExploreEvents,
  ExploreEventsView,
  createInitialCenter
} from "@explore-events-boundary"
import { LocationCoordinate2D } from "TiFShared/domain-models/LocationCoordinate2D"

export type ExploreEventsScreensParamsList = {
  exploreEvents: { searchText: string; center?: LocationCoordinate2D }
  exploreEventsLocationSearch: undefined
  exploreEventsForm: { coordinates: LocationCoordinate2D }
}

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
  fetchEvents: (
    region: Region,
    signal?: AbortSignal
  ) => Promise<CurrentUserEvent[]>
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
  fetchEvents: (
    region: Region,
    signal?: AbortSignal
  ) => Promise<CurrentUserEvent[]>
} & ExploreEventsProps

const ExploreEventsScreen = ({
  route,
  fetchEvents
}: ExploreEventsScreenProps) => {
  const { region, data, updateRegion } = useExploreEvents(
    createInitialCenter(route.params.center),
    {
      fetchEvents,
      isSignificantlyDifferentRegions
    }
  )
  return (
    <ExploreEventsView
      region={region}
      data={data}
      onRegionUpdated={updateRegion}
      searchText={route.params.searchText}
      onEventTapped={() => {}}
      onMapLongPress={console.log}
      onSearchTapped={() => console.log("Search")}
      style={styles.exploreEvents}
    />
  )
}

const styles = StyleSheet.create({
  exploreEvents: {
    width: "100%",
    height: "100%"
  }
})
