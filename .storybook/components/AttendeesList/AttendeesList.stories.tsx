import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { BodyText, Subtitle } from "@components/Text"
import {
  EventAttendeeMocks,
  EventMocks
} from "@event-details-boundary/MockData"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { View } from "react-native"
import { StoryMeta } from ".storybook/HelperTypes"
import {
  EventAttendeesListView,
  useEventAttendeesList
} from "@event-details-boundary/AttendeesList"
import { clientSideEventFromResponse } from "@event/ClientSideEvent"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"

const AttendeesListMeta: StoryMeta = {
  title: "Attendees List Screen"
}
export default AttendeesListMeta

type AttendeesListStory = ComponentStory<typeof View>

const Stack = createStackNavigator()

export const Basic: AttendeesListStory = () => (
  <TestQueryClientProvider>
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="attendeesList"
        screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}
      >
        <Stack.Screen
          name="attendeesList"
          component={AttendeesListTestScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  </TestQueryClientProvider>
)

const AttendeesListTestScreen = () => {
  return (
    <View>
      <EventAttendeesListView
        state={useEventAttendeesList({
          eventId: 1,
          event: async () => ({
            status: "success",
            event: clientSideEventFromResponse(
              EventMocks.MockSingleAttendeeResponse
            )
          })
        })}
        onExploreOtherEventsTapped={() => console.log("Explore others")}
        style={{ height: "100%" }}
      />
    </View>
  )
}
