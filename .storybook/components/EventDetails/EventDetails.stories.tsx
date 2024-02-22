import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React, { useEffect } from "react"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import {
  EventAttendeeMocks,
  EventMocks,
  mockEventLocation
} from "@event-details/MockData"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { UserLocationFunctionsProvider } from "@location/UserLocation"
import {
  getCurrentPositionAsync,
  requestBackgroundPermissionsAsync,
  requestForegroundPermissionsAsync
} from "expo-location"
import { mockPlacemark } from "@location/MockData"
import { EventDetailsView, useLoadEventDetails } from "@event-details/Details"
import { createTestQueryClient } from "@test-helpers/ReactQuery"
import { QueryClientProvider } from "@tanstack/react-query"
import { ColorString } from "@lib/utils/Color"
import { sleep } from "@lib/utils/DelayData"
import { EventDetailsProvider } from "@event-details/Context"

const EventDetailsMeta: ComponentMeta<typeof SettingsScreen> = {
  title: "Event Details"
}

export default EventDetailsMeta

type EventDetailsStory = ComponentStory<typeof SettingsScreen>

const event = EventMocks.PickupBasketball

const location = {
  ...mockEventLocation(),
  coordinate: { latitude: 36.96493, longitude: -122.01693 },
  placemark: mockPlacemark()
}

const queryClient = createTestQueryClient()

export const Basic: EventDetailsStory = () => {
  useEffect(() => {
    queryClient.resetQueries()
  }, [])
  return (
    <SafeAreaProvider>
      <SafeAreaView edges={["top"]}>
        <UserLocationFunctionsProvider
          getCurrentLocation={getCurrentPositionAsync}
          requestBackgroundPermissions={requestBackgroundPermissionsAsync}
          requestForegroundPermissions={requestForegroundPermissionsAsync}
        >
          <QueryClientProvider client={queryClient}>
            <BottomSheetModalProvider>
              <Test />
            </BottomSheetModalProvider>
          </QueryClientProvider>
        </UserLocationFunctionsProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const host = EventAttendeeMocks.Alivs

const Test = () => {
  const result = useLoadEventDetails(1, async () => {
    // await sleep(30000)
    return {
      status: "success",
      event: {
        ...EventMocks.PickupBasketball,
        location,
        color: ColorString.parse("#345995")!,
        description:
          "Hello world, this is an @event of some kind. Please join it if you like to do !17|123/#2BC016/Pickup Basketball. \n\nNow I write this endless storybook story in the void, where \nI can test things like @hello to make sure that links are highlighting and I am not going absolutely crazy."
      }
    }
  })
  return (
    <EventDetailsProvider
      travelEstimates={async () => {
        await sleep(10_000)
        throw new Error("lol")
      }}
    >
      <EventDetailsView result={result} onExploreOtherEventsTapped={() => {}} />
    </EventDetailsProvider>
  )
}
