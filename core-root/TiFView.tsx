import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { TabNavigation } from "./navigation"

const Stack = createStackNavigator()

export type TiFProps = {
  isFontsLoaded: boolean
}

export const TiFView = ({ isFontsLoaded }: TiFProps) => {
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
