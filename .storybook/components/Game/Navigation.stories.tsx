import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React from "react"
import { View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Navigation } from "./Navigation"

const GameNavigationMeta: ComponentMeta<typeof View> = {
  title: "GameNavigation"
}

export default GameNavigationMeta

type GameNavigationStory = ComponentStory<typeof View>

export const Basic: GameNavigationStory = () => (
  <SafeAreaProvider>
    <GestureHandlerRootView>
      <Navigation />
    </GestureHandlerRootView>
  </SafeAreaProvider>
)
