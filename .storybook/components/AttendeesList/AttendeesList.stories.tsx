import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { BodyText, Subtitle } from "@components/Text"
import { EventAttendeeMocks } from "@event-details/MockData"
import { AttendeesListView } from "@event-details/attendees-list/AttendeesList"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { EventAttendee } from "@shared-models/Event"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React from "react"
import { View } from "react-native"

const AttendeesListMeta: ComponentMeta<typeof SettingsScreen> = {
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
        status={"success"}
        attendees={testValue.attendees}
        renderAttendee={renderAttendee}
        totalAttendeeCount={testValue.attendeeCount}
        refresh={() => console.log("Refresh")}
        isRefetching={false}
        host={testValue.host}
        isFetchingNextPage={false}
      />
    </View>
  )
}
