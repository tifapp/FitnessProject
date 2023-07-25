import React from "react"
import { RootSiblingParent } from "react-native-root-siblings"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { TiFQueryClientProvider } from "@components/TiFQueryClientProvider"
import { useAppFonts } from "@hooks/Fonts"
import { TabNavigation } from "@stacks/ActivitiesStack"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { TiFMenuProvider } from "@components/TiFMenuProvider"

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

const App = () => {
  const [isFontsLoaded] = useAppFonts()
  return (
    <TiFQueryClientProvider>
      <SafeAreaProvider>
        <TiFMenuProvider>
          <RootSiblingParent>
            <AppView isFontsLoaded={isFontsLoaded} />
          </RootSiblingParent>
        </TiFMenuProvider>
      </SafeAreaProvider>
    </TiFQueryClientProvider>
  )
}

export default App
