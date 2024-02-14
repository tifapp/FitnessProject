import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { View } from "react-native"
import {
  EventAttendeeMocks,
  EventMocks,
  mockEventLocation
} from "@event-details/MockData"
import { TiFQueryClientProvider } from "@lib/ReactQuery"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import {
  EventTravelEstimatesView,
  loadEventTravelEstimates,
  useEventTravelEstimates
} from "@event-details/TravelEstimates"
import { ExpoTiFTravelEstimates } from "@modules/tif-travel-estimates"
import { UserLocationFunctionsProvider } from "@location/UserLocation"
import {
  getCurrentPositionAsync,
  requestBackgroundPermissionsAsync,
  requestForegroundPermissionsAsync
} from "expo-location"
import { mockPlacemark } from "@location/MockData"
import { sleep } from "@lib/utils/DelayData"

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

export const Basic: EventDetailsStory = () => {
  return (
    <SafeAreaProvider>
      <View style={{ width: "100%", marginTop: 256 }}>
        <UserLocationFunctionsProvider
          getCurrentLocation={getCurrentPositionAsync}
          requestBackgroundPermissions={requestBackgroundPermissionsAsync}
          requestForegroundPermissions={requestForegroundPermissionsAsync}
        >
          <TiFQueryClientProvider>
            <BottomSheetModalProvider>
              <Test />
            </BottomSheetModalProvider>
          </TiFQueryClientProvider>
        </UserLocationFunctionsProvider>
      </View>
    </SafeAreaProvider>
  )
}

const host = EventAttendeeMocks.Alivs

const Test = () => {
  const result = useEventTravelEstimates(
    location.coordinate,
    async (eventCoordinate, userCoordinate, signal) => {
      throw new Error("Died")
    }
  )
  console.log(result)
  return (
    <EventTravelEstimatesView 
      host={host} 
      location={location} 
      result={result} 
    />
  )
}
