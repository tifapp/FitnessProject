import { EventForm } from "@components/eventForm"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { EventFormTestScreen } from "@screens/testScreens/EventFormTestScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React from "react"

const Stack = createStackNavigator()

const EventFormMeta: ComponentMeta<typeof EventForm> = {
  title: "EventForm",
  component: EventFormTestScreen,
  decorators: [
    (Story) => (
      <NavigationContainer>
        <Story />
      </NavigationContainer>
    )
  ]
}

export default EventFormMeta

type EventFormStory = ComponentStory<typeof EventForm>

export const EmptyForm: EventFormStory = (args) => <EventFormTestScreen />
