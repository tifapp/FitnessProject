import { EventMocks } from "@lib/events"
import { ExploreEventsView } from "@screens/ExploreEvents"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import { AppQueryClientProvider } from "@components/AppQueryClientProvider"
import React from "react"
import { SetDependencyValue } from "@lib/dependencies"
import { UserLocationDependencyKeys } from "@hooks/UserLocation"
import { LocationCoordinatesMocks } from "@lib/location"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { MenuProvider } from "react-native-popup-menu"

const ExploreEventsMeta: ComponentMeta<typeof ExploreEventsView> = {
  title: "Explore Events Screen",
  component: ExploreEventsView
}

export default ExploreEventsMeta

type ExploreEventsStory = ComponentStory<typeof ExploreEventsView>

export const Basic: ExploreEventsStory = () => (
  <MenuProvider>
    <BottomSheetModalProvider>
      <AppQueryClientProvider>
        <SetDependencyValue
          forKey={UserLocationDependencyKeys.currentCoordinates}
          value={async () => {
            throw new Error()
          }}
        >
          <ExploreEventsView
            initialCenter={{
              center: "preset",
              coordinates: LocationCoordinatesMocks.SanFrancisco
            }}
            fetchEvents={() => ({
              // value: Promise.resolve([
              //   EventMocks.Multiday,
              //   EventMocks.NoPlacemarkInfo,
              //   EventMocks.PickupBasketball
              // ]),
              value: Promise.resolve([]),
              cancel: () => {}
            })}
            onMapLongPress={console.log}
            onEventTapped={console.log}
            style={{ width: "100%", height: "100%" }}
          />
        </SetDependencyValue>
      </AppQueryClientProvider>
    </BottomSheetModalProvider>
  </MenuProvider>
)
