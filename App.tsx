import { TiFMenuProvider } from "@components/TiFMenuProvider"
import { TiFQueryClientProvider } from "@components/TiFQueryClientProvider"
import { useAppFonts } from "@hooks/Fonts"
import { UserLocationFunctionsProvider } from "@hooks/UserLocation"
import { HapticsProvider, PersistentHaptics } from "@lib/Haptics"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { TabNavigation } from "@stacks/ActivitiesStack"
import {
  getCurrentPositionAsync,
  requestForegroundPermissionsAsync
} from "expo-location"
import React from "react"
import { RootSiblingParent } from "react-native-root-siblings"
import { SafeAreaProvider } from "react-native-safe-area-context"

const Stack = createStackNavigator()

export type AppProps = {
  isFontsLoaded: boolean
}

const AppView = ({ isFontsLoaded }: AppProps) => {
  if (!isFontsLoaded) return null // TODO: - Splash Screen?
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Activities Screen"
          component={TabNavigation}
          options={{
            headerShown: false
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const haptics = new PersistentHaptics()

const App = () => {
  const [isFontsLoaded] = useAppFonts()
  return (
    <TiFQueryClientProvider>
      <HapticsProvider haptics={haptics}>
        <UserLocationFunctionsProvider
          getCurrentLocation={getCurrentPositionAsync}
          requestForegroundPermissions={requestForegroundPermissionsAsync}
        >
          <SafeAreaProvider>
            <TiFMenuProvider>
              <RootSiblingParent>
                <AppView isFontsLoaded={isFontsLoaded} />
              </RootSiblingParent>
            </TiFMenuProvider>
          </SafeAreaProvider>
        </UserLocationFunctionsProvider>
      </HapticsProvider>
    </TiFQueryClientProvider>
  )
}

export default App
