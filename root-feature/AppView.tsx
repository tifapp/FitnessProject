import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { TabNavigation } from "./Navigation/TabNavigation"

const Stack = createStackNavigator()

export type AppProps = {
  isFontsLoaded: boolean
}

export const AppView = ({ isFontsLoaded }: AppProps) => {
  if (!isFontsLoaded) return null
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="tabs"
          component={TabNavigation}
          options={{
            headerShown: false
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
