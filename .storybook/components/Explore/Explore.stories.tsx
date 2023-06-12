import { EventMocks } from "@lib/events"
import {
  ExploreEventsScreensParamsList,
  ExploreEventsView,
  createExploreEventsScreensStack
} from "@screens/ExploreEvents"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import { AppQueryClientProvider } from "@components/AppQueryClientProvider"
import React from "react"
import { UpdateDependencyValues } from "@lib/dependencies"
import { UserLocationDependencyKeys } from "@hooks/UserLocation"
import { mockLocationSearchResult } from "@lib/location"
import { MenuProvider } from "react-native-popup-menu"
import { createStackNavigator } from "@react-navigation/stack"
import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { NavigationContainer } from "@react-navigation/native"
import { LocationSearchDependencyKeys } from "@screens/LocationSearch"

const ExploreEventsMeta: ComponentMeta<typeof ExploreEventsView> = {
  title: "Explore Events Screen",
  component: ExploreEventsView
}

export default ExploreEventsMeta

type ExploreEventsStory = ComponentStory<typeof ExploreEventsView>

const Stack = createStackNavigator<ExploreEventsScreensParamsList>()
const screens = createExploreEventsScreensStack(Stack, () => ({
  value: Promise.resolve([
    EventMocks.Multiday,
    EventMocks.NoPlacemarkInfo,
    EventMocks.PickupBasketball
  ]),
  cancel: () => {}
}))

export const Basic: ExploreEventsStory = () => (
  <MenuProvider>
    <AppQueryClientProvider>
      <UpdateDependencyValues
        update={(values) => {
          values.set(UserLocationDependencyKeys.currentCoordinates, () =>
            Promise.reject()
          )
          values.set(LocationSearchDependencyKeys.searchForResults, () =>
            Promise.resolve([mockLocationSearchResult()])
          )
        }}
      >
        <NavigationContainer onStateChange={console.log}>
          <Stack.Navigator screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}>
            {screens}
          </Stack.Navigator>
        </NavigationContainer>
      </UpdateDependencyValues>
    </AppQueryClientProvider>
  </MenuProvider>
)
