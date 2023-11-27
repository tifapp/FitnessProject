import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { TiFQueryClientProvider } from "@components/TiFQueryClientProvider"
import { UserLocationFunctionsProvider } from "@hooks/UserLocation"
import { ArrayUtils } from "@lib/Array"
import { delayData } from "@lib/DelayData"
import {
  LocationSearchPicker,
  useLocationSearchPicker
} from "@location-search/Picker"
import { LocationSearchBar } from "@location-search/SearchBar"
import { mockLocationSearchResult } from "@location-search/mocks"
import {
  NavigationContainer,
  NavigationProp,
  ParamListBase,
  useNavigation
} from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import { PermissionStatus, getCurrentPositionAsync } from "expo-location"
import React from "react"
import { Button } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const LocationSearchMeta: ComponentMeta<typeof SettingsScreen> = {
  title: "Location Search Screen"
}

export default LocationSearchMeta

type LocationSearchStory = ComponentStory<typeof SettingsScreen>

const Stack = createStackNavigator()

export const Basic: LocationSearchStory = () => (
  <TiFQueryClientProvider>
    <UserLocationFunctionsProvider
      getCurrentLocation={getCurrentPositionAsync}
      requestForegroundPermissions={async () => ({
        expires: Infinity,
        canAskAgain: true,
        granted: true,
        status: PermissionStatus.GRANTED
      })}
      requestBackgroundPermissions={async () => ({
        expires: Infinity,
        canAskAgain: true,
        granted: true,
        status: PermissionStatus.GRANTED
      })}
    >
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
    </UserLocationFunctionsProvider>
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
  const picker = useLocationSearchPicker({
    loadSearchResults: async () => {
      return await delayData(
        ArrayUtils.repeatElements(15, () => mockLocationSearchResult()),
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
