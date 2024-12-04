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
import { useLoadEventDetails } from "@event-details-boundary/Details"
import { TiFQueryClientProvider } from "@lib/ReactQuery"
import { dateRange } from "TiFShared/domain-models/FixedDateRange"
import { dayjs, now } from "TiFShared/lib/Dayjs"
import { StoryMeta } from ".storybook/HelperTypes"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { TiFBottomSheetProvider } from "@components/BottomSheet"
import {
  EventUserAttendanceButton,
  EventUserAttendanceProvider
} from "@event/UserAttendance"
import { loadJoinEventPermissions } from "@event/JoinEvent"
import { EventActionsMenuView, useEventActionsMenu } from "@event/Menu"
import { UserSessionProvider } from "@user/Session"
import { uuidString } from "@lib/utils/UUID"
import { EmailAddress } from "@user/privacy"
import { EventCard } from "@event/EventCard"
import { ScrollView } from "react-native"
import { AlphaUserSessionProvider, AlphaUserStorage } from "@user/alpha"
import {
  AlphaRegisterProvider,
  withAlphaRegistration
} from "@core-root/AlphaRegister"
import { AlphaUserMocks } from "@user/alpha/MockData"

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
      <SafeAreaProvider>
        <AlphaUserSessionProvider storage={storage}>
          <AlphaRegisterProvider
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
          </AlphaRegisterProvider>
        </AlphaUserSessionProvider>
      </SafeAreaProvider>
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
  const result = useLoadEventDetails(
    EventMocks.MockMultipleAttendeeResponse.id,
    async () => ({
      status: "success",
      event: clientSideEventFromResponse({
        ...EventMocks.MockMultipleAttendeeResponse,
        attendeeCount: 4,
        userAttendeeStatus: "hosting",
        previewAttendees: [
          ...EventMocks.MockMultipleAttendeeResponse.previewAttendees,
          {
            ...EventMocks.MockMultipleAttendeeResponse.previewAttendees[0],
            id: uuidString(),
            name: "Mario"
          },
          {
            ...EventMocks.MockMultipleAttendeeResponse.previewAttendees[1],
            id: uuidString(),
            name: "Luigi"
          }
        ]
      })
    })
  )
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
      <EventUserAttendanceProvider
        joinEvent={async () => "success"}
        loadPermissions={async () => {
          const perms = await loadJoinEventPermissions()
          return perms.map((p) => ({ ...p, canRequestPermission: true }))
        }}
        leaveEvent={async () => "success"}
      >
        <EventCard event={event} style={{ paddingHorizontal: 24 }} />
      </EventUserAttendanceProvider>
    </ScrollView>
  )
}
