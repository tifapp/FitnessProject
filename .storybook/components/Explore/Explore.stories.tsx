import { EventMocks } from "@lib/events"
import { ExploreEventsView } from "@screens/ExploreEvents"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import { AppQueryClientProvider } from "@components/AppQueryClientProvider"
import React from "react"
import { SetDependencyValue } from "@lib/dependencies"
import { UserLocationDependencyKeys } from "@hooks/UserLocation"
import { LocationCoordinatesMocks } from "@lib/location"

const ExploreEventsMeta: ComponentMeta<typeof ExploreEventsView> = {
  title: "Explore Events Screen",
  component: ExploreEventsView
}

export default ExploreEventsMeta

type ExploreEventsStory = ComponentStory<typeof ExploreEventsView>

export const Basic: ExploreEventsStory = () => (
  <AppQueryClientProvider>
    <SetDependencyValue
      forKey={UserLocationDependencyKeys.currentCoordinates}
      value={async () => {
        return {
          coordinates: LocationCoordinatesMocks.NYC,
          trackingDate: new Date()
        }
      }}
    >
      <ExploreEventsView
        initialCenter={{
          center: "preset",
          coordinates: LocationCoordinatesMocks.SanFrancisco
        }}
        fetchEvents={() => ({
          value: Promise.resolve([
            EventMocks.Multiday,
            EventMocks.NoPlacemarkInfo,
            EventMocks.PickupBasketball
          ]),
          cancel: () => {}
        })}
        onMapLongPress={console.log}
        onEventTapped={console.log}
        style={{ width: "100%", height: "100%" }}
      />
    </SetDependencyValue>
  </AppQueryClientProvider>
)
