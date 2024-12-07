import { EventMocks } from "@event-details-boundary/MockData"
import {
  ExploreEventsView,
  createInitialCenter,
  isSignificantlyDifferentRegions,
  useExploreEvents
} from "@explore-events-boundary"
import { TiFQueryClientProvider } from "@lib/ReactQuery"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { MenuProvider } from "react-native-popup-menu"
import { SafeAreaProvider } from "react-native-safe-area-context"

const ExploreEventsMeta: ComponentMeta<typeof ExploreEventsView> = {
  title: "Explore Events Screen",
  component: ExploreEventsView
}

export default ExploreEventsMeta

type ExploreEventsStory = ComponentStory<typeof ExploreEventsView>

const fetchEvents = async () => [
  EventMocks.Multiday,
  EventMocks.NoPlacemarkInfo,
  EventMocks.PickupBasketball
]

export const Basic: ExploreEventsStory = () => (
  <GestureHandlerRootView>
    <MenuProvider>
      <TiFQueryClientProvider>
        <SafeAreaProvider>
          <Explore />
        </SafeAreaProvider>
      </TiFQueryClientProvider>
    </MenuProvider>
  </GestureHandlerRootView>
)

const Explore = () => {
  const { region, data, updateRegion } = useExploreEvents(
    createInitialCenter(),
    { fetchEvents, isSignificantlyDifferentRegions }
  )
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
