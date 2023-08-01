import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { TiFQueryClientProvider } from "@components/TiFQueryClientProvider"
import { UserLocationFunctionsProvider } from "@hooks/UserLocation"
import { delayData } from "@lib/DelayData"
import { mockLocationSearchResult } from "@lib/location"
import { NavigationContainer, useNavigation } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import {
  LocationSearchBar,
  LocationSearchPicker,
  useLocationSearchPicker
} from "@screens/LocationSearch"
import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import {
  getCurrentPositionAsync,
  requestForegroundPermissionsAsync
} from "expo-location"
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
      requestForegroundPermissions={requestForegroundPermissionsAsync}
    >
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}>
          <Stack.Screen name="settings" component={TestScreen} />
          <Stack.Screen
            name="search"
            options={{
              header: ({ navigation }) => {
                const insets = useSafeAreaInsets()
                return (
                  <LocationSearchBar
                    placeholder="Search for locations..."
                    onBackTapped={navigation.goBack}
                    style={{ marginTop: insets.top, marginHorizontal: 16 }}
                  />
                )
              }
            }}
            component={LocationSearchScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </UserLocationFunctionsProvider>
  </TiFQueryClientProvider>
)

const LocationSearchScreen = () => {
  const picker = useLocationSearchPicker({
    loadSearchResults: async () => {
      return await delayData(
        [
          mockLocationSearchResult(),
          mockLocationSearchResult(),
          mockLocationSearchResult()
        ],
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
      style={{ marginTop: 16 }}
    />
  )
}

const TestScreen = () => {
  const navigation = useNavigation()
  return (
    <Button
      title="Go to Location Search"
      onPress={() => navigation.navigate("search")}
    />
  )
}
