import React, { useCallback, useEffect } from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import {
  EventAttendeeMocks,
  EventMocks,
  mockEventLocation
} from "@event-details-boundary/MockData"
import { UserLocationFunctionsProvider } from "@location/UserLocation"
import {
  getCurrentPositionAsync,
  requestBackgroundPermissionsAsync,
  requestForegroundPermissionsAsync
} from "expo-location"
import { mockPlacemark } from "@location/MockData"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { createTestQueryClient } from "@test-helpers/ReactQuery"
import { View } from "react-native"
import {
  ClientSideEvent,
  clientSideEventFromResponse
} from "@event/ClientSideEvent"
import { TiFQueryClientProvider } from "@lib/ReactQuery"
import { dateRange } from "TiFShared/domain-models/FixedDateRange"
import { dayjs, now } from "TiFShared/lib/Dayjs"
import { StoryMeta } from ".storybook/HelperTypes"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { TiFBottomSheetProvider } from "@components/BottomSheet"
import {
  EventUserAttendanceButton,
  EventUserAttendanceFeature
} from "@event/UserAttendance"
import { loadJoinEventPermissions } from "@event/JoinEvent"
import { EventActionsMenuView, useEventActionsMenu } from "@event/Menu"
import { UserSessionProvider } from "@user/Session"
import { uuidString } from "TiFShared/lib/UUID"
import { EmailAddress } from "@user/privacy"
import { EventCard } from "@event/EventCard"
import { ScrollView } from "react-native"
import { AlphaUserSessionProvider, AlphaUserStorage } from "@user/alpha"
import {
  AlphaRegisterFeature,
  withAlphaRegistration
} from "@core-root/AlphaRegister"
import { AlphaUserMocks } from "@user/alpha/MockData"
import { EventDetailsFeature, useLoadEventDetails } from "@event/DetailsQuery"

const EventDetailsMeta: StoryMeta = {
  title: "Event Details"
}

export default EventDetailsMeta

type EventDetailsStory = ComponentStory<typeof SettingsScreen>

const event = EventMocks.PickupBasketball

const Stack = createStackNavigator()

const location = {
  ...mockEventLocation(),
  coordinate: { latitude: 36.96493, longitude: -122.01693 },
  placemark: mockPlacemark()
}

const queryClient = createTestQueryClient()

const storage = AlphaUserStorage.ephemeral()

export const Basic: EventDetailsStory = () => {
  useEffect(() => {
    queryClient.resetQueries()
  }, [])

  return (
    <GestureHandlerRootView>
      <EventDetailsFeature.Provider
        eventDetails={async () => ({
          status: "success",
          event: clientSideEventFromResponse(
            EventMocks.MockMultipleAttendeeResponse
          )
        })}
      >
        <SafeAreaProvider>
          <AlphaUserSessionProvider storage={storage}>
            <AlphaRegisterFeature.Provider
              register={async () => AlphaUserMocks.TheDarkLord}
            >
              <UserLocationFunctionsProvider
                getCurrentLocation={getCurrentPositionAsync}
                requestBackgroundPermissions={requestBackgroundPermissionsAsync}
                requestForegroundPermissions={requestForegroundPermissionsAsync}
              >
                <TiFQueryClientProvider>
                  <TiFBottomSheetProvider>
                    <NavigationContainer>
                      <Stack.Navigator
                        screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}
                      >
                        <Stack.Screen name="test" component={Test} />
                      </Stack.Navigator>
                    </NavigationContainer>
                  </TiFBottomSheetProvider>
                </TiFQueryClientProvider>
              </UserLocationFunctionsProvider>
            </AlphaRegisterFeature.Provider>
          </AlphaUserSessionProvider>
        </SafeAreaProvider>
      </EventDetailsFeature.Provider>
    </GestureHandlerRootView>
  )
}

const host = EventAttendeeMocks.Alivs

const time = {
  secondsToStart: dayjs.duration(15.1, "minute").asSeconds(),
  todayOrTomorrow: "tomorrow",
  clientReceivedTime: new Date(),
  dateRange: dateRange(new Date(), now().add(1, "hour").toDate())
} as const

const Test = withAlphaRegistration(() => {
  const result = useLoadEventDetails(EventMocks.MockMultipleAttendeeResponse.id)
  if (result.status !== "success") return undefined
  return <Menu event={result.event} />
})

const Menu = ({ event }: { event: ClientSideEvent }) => {
  console.log(event)
  return (
    <ScrollView
      style={{
        height: "100%"
      }}
    >
      <EventUserAttendanceFeature.Provider
        joinEvent={async () => "success"}
        loadPermissions={async () => {
          const perms = await loadJoinEventPermissions()
          return perms.map((p) => ({ ...p, canRequestPermission: true }))
        }}
        leaveEvent={async () => "success"}
      >
        <EventCard event={event} style={{ paddingHorizontal: 24 }} />
      </EventUserAttendanceFeature.Provider>
    </ScrollView>
  )
}
