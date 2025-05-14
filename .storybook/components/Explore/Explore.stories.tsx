import { StoryMeta } from ".storybook/HelperTypes"
import { EventMocks } from "@event-details-boundary/MockData"
import {
  ExploreEventsView,
  createInitialCenter,
  isSignificantlyDifferentRegions,
  useExploreEvents
} from "@explore-events-boundary"
import { TiFQueryClientProvider } from "@lib/ReactQuery"
import { AlphaUserSessionProvider, AlphaUserStorage } from "@user/alpha"
import React from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { MenuProvider } from "react-native-popup-menu"
import { SafeAreaProvider } from "react-native-safe-area-context"

const ExploreEventsMeta: StoryMeta = {
  title: "Explore Events Screen",
  component: ExploreEventsView
}

export default ExploreEventsMeta

const fetchEvents = async () => [
  EventMocks.MockMultipleAttendeeResponse,
  EventMocks.MockSingleAttendeeResponse
]

const storage = AlphaUserStorage.ephemeral()

export const Basic = () => (
  <AlphaUserSessionProvider storage={storage}>
    <GestureHandlerRootView>
      <MenuProvider>
        <TiFQueryClientProvider>
          <SafeAreaProvider>
            <Explore />
          </SafeAreaProvider>
        </TiFQueryClientProvider>
      </MenuProvider>
    </GestureHandlerRootView>
  </AlphaUserSessionProvider>
)

const Explore = () => {
  const { region, data, updateRegion } = useExploreEvents(
    createInitialCenter(),
    { fetchEvents, isSignificantlyDifferentRegions }
  )
  console.log(data)
  return (
    <ExploreEventsView
      region={region}
      data={data}
      onRegionUpdated={updateRegion}
      onEventTapped={console.log}
      onMapLongPress={console.log}
      style={{ height: "100%" }}
    />
  )
}
