import { createStaticNavigation } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { StyleSheet, StyleProp, ViewStyle, View } from "react-native"
import React from "react"
import { HomeView } from "./Home"
import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { TiFContext, TiFContextValues } from "./Context"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { RootSiblingParent } from "react-native-root-siblings"
import { TiFQueryClientProvider } from "@lib/ReactQuery"
import { withAlphaRegistration } from "./AlphaRegister"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { EditEventNavigator } from "./navigation/EditEvent"
import { eventDetailsScreens } from "./navigation/EventDetails"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { TiFBottomSheetProvider } from "@components/BottomSheet"

const HomeScreen = withAlphaRegistration(() => (
  <HomeView style={styles.screen} />
))

const Stack = createNativeStackNavigator({
  screenOptions: BASE_HEADER_SCREEN_OPTIONS,
  screens: {
    home: {
      options: { headerShown: false },
      screen: HomeScreen
    },
    ...eventDetailsScreens()
  },
  groups: {
    modals: {
      screenOptions: { presentation: "modal", headerShown: false },
      screens: { editEvent: EditEventNavigator }
    }
  }
})

const Navigation = createStaticNavigation(Stack)

const linking = { prefixes: ["tifapp://"] }

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
    <GestureHandlerRootView>
      <TiFQueryClientProvider>
        <SafeAreaProvider>
          <RootSiblingParent>
            <TiFBottomSheetProvider>
              <View style={style}>
                <TiFContext.Provider value={props}>
                  <Navigation linking={linking} />
                </TiFContext.Provider>
              </View>
            </TiFBottomSheetProvider>
          </RootSiblingParent>
        </SafeAreaProvider>
      </TiFQueryClientProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1
  }
})
