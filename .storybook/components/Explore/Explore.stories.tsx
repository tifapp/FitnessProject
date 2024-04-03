import { ExploreEventsView } from "@core-explore-events"
import { EventMocks } from "@core-event-details/MockData"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import { TiFQueryClientProvider } from "@lib/ReactQuery"
import {
  ExploreEventsScreensParamsList,
  createExploreEventsScreens
} from "@core-root/navigation/ExploreEvents"
import React from "react"
import { MenuProvider } from "react-native-popup-menu"
import { createStackNavigator } from "@react-navigation/stack"
import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { NavigationContainer } from "@react-navigation/native"
import { SafeAreaProvider } from "react-native-safe-area-context"

const ExploreEventsMeta: ComponentMeta<typeof ExploreEventsView> = {
  title: "Explore Events Screen",
  component: ExploreEventsView
}

export default ExploreEventsMeta

type ExploreEventsStory = ComponentStory<typeof ExploreEventsView>

const Stack = createStackNavigator<ExploreEventsScreensParamsList>()
const screens = createExploreEventsScreens(Stack, async () => [
  EventMocks.Multiday,
  EventMocks.NoPlacemarkInfo,
  EventMocks.PickupBasketball
])

export const Basic: ExploreEventsStory = () => (
  <MenuProvider>
    <TiFQueryClientProvider>
      <SafeAreaProvider>
        <NavigationContainer onStateChange={console.log}>
          <Stack.Navigator screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}>
            {screens}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </TiFQueryClientProvider>
  </MenuProvider>
)
