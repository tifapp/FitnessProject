import { StoryMeta } from ".storybook/HelperTypes"
import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { TiFQueryClientProvider } from "@lib/ReactQuery"

import { delayData } from "@lib/utils/DelayData"
import {
  LocationSearchBar,
  LocationSearchPicker,
  useLocationsSearch
} from "@location-search-boundary"
import { mockLocationSearchResult } from "@location-search-boundary/MockData"
import {
  NavigationContainer,
  NavigationProp,
  ParamListBase,
  useNavigation
} from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { ComponentStory } from "@storybook/react-native"
import { repeatElements } from "TiFShared/lib/Array"
import React from "react"
import { Button } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const LocationSearchMeta: StoryMeta = {
  title: "Location Search Screen"
}

export default LocationSearchMeta

type LocationSearchStory = ComponentStory<typeof SettingsScreen>

const Stack = createStackNavigator()

export const Basic: LocationSearchStory = () => (
  <TiFQueryClientProvider>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}>
        <Stack.Screen name="settings" component={TestScreen} />
        <Stack.Screen
          name="search"
          options={{
            header: () => <LocationSearchHeader />,
            headerMode: "screen"
          }}
          component={LocationSearchScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  </TiFQueryClientProvider>
)

const LocationSearchHeader = () => {
  const insets = useSafeAreaInsets()
  const navigation: NavigationProp<ParamListBase> = useNavigation()
  return (
    <LocationSearchBar
      placeholder="Search for locations..."
      onBackTapped={navigation.goBack}
      style={{ marginTop: insets.top, marginHorizontal: 16 }}
    />
  )
}

const LocationSearchScreen = () => {
  const picker = useLocationsSearch({
    loadSearchResults: async () => {
      return await delayData(
        repeatElements(15, () => mockLocationSearchResult()),
        3000
      )
    }
  })
  return (
    <LocationSearchPicker
      {...picker}
      savePickedLocation={(location) => console.log("Saved", location)}
      onUserLocationSelected={console.log}
      onLocationSelected={console.log}
      contentContainerStyle={{ paddingVertical: 16 }}
    />
  )
}

const TestScreen = () => {
  const navigation: NavigationProp<ParamListBase> = useNavigation()
  return (
    <Button
      title="Go to Location Search"
      onPress={() => navigation.navigate("search")}
    />
  )
}
