import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { BodyText, Subtitle } from "@components/Text"
import { EventAttendeeMocks } from "@event-details-boundary/MockData"
import { AttendeesListView } from "@event-details-boundary/attendees-list/AttendeesList"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { EventAttendee } from "@event/ClientSideEvent"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React from "react"
import { View } from "react-native"
import { StoryMeta } from ".storybook/HelperTypes"

const AttendeesListMeta: StoryMeta = {
  title: "Attendees List Screen"
}
export default AttendeesListMeta

type AttendeesListStory = ComponentStory<typeof SettingsScreen>

const Stack = createStackNavigator()

export const Basic: AttendeesListStory = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="attendeesList"
      screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}
    >
      <Stack.Screen name="attendeesList" component={AttendeesListTestScreen} />
    </Stack.Navigator>
  </NavigationContainer>
)

const AttendeesListTestScreen = () => {
  const testValue = {
    host: EventAttendeeMocks.Alivs,
    attendees: [EventAttendeeMocks.AnnaAttendee, EventAttendeeMocks.BlobJr],
    attendeeCount: 3
  }
  const renderAttendee = (attendee: EventAttendee) => {
    return (
      <View>
        <Subtitle> {attendee.username} </Subtitle>
        <BodyText> {attendee.handle.toString()} </BodyText>
      </View>
    )
  }
  return (
    <View>
      <AttendeesListView
        attendees={testValue.attendees}
        renderAttendee={renderAttendee}
        totalAttendeeCount={testValue.attendeeCount}
        refresh={() => console.log("Refresh")}
        isRefetching={false}
      />
    </View>
  )
}
