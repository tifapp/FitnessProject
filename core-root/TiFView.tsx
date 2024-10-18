import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { StyleSheet, StyleProp, ViewStyle, View } from "react-native"
import React from "react"
import { HomeView } from "./Home"
import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { TiFContext, TiFContextValues } from "./Context"
import { TiFMenuProvider } from "@components/TiFMenuProvider"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { RootSiblingParent } from "react-native-root-siblings"
import { TiFQueryClientProvider } from "@lib/ReactQuery"

const Stack = createStackNavigator()

export type TiFProps = {
  isFontsLoaded: boolean
  style?: StyleProp<ViewStyle>
} & TiFContextValues

/**
 * The root view of the app.
 */
export const TiFView = ({ isFontsLoaded, style, ...props }: TiFProps) => {
  if (!isFontsLoaded) return null
  return (
    <TiFQueryClientProvider>
      <SafeAreaProvider>
        <TiFMenuProvider>
          <RootSiblingParent>
            <View style={style}>
              <TiFContext.Provider value={props}>
                <NavigationContainer>
                  <Stack.Navigator screenOptions={BASE_HEADER_SCREEN_OPTIONS}>
                    <Stack.Screen
                      name="home"
                      component={HomeScreen}
                      options={{ headerShown: false }}
                    />
                  </Stack.Navigator>
                </NavigationContainer>
              </TiFContext.Provider>
            </View>
          </RootSiblingParent>
        </TiFMenuProvider>
      </SafeAreaProvider>
    </TiFQueryClientProvider>
  )
}

const HomeScreen = () => {
  return (
    <HomeView
      onViewEventTapped={() => console.log("TODO: Navigate to Event Details")}
      style={styles.home}
    />
  )
}

const styles = StyleSheet.create({
  home: {
    flex: 1
  }
})
