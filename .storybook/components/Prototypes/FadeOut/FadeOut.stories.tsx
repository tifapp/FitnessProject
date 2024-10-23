import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React, { useState } from "react"
import { View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Title } from "../../../../components/Text"
import { FadeOut } from "./FadeOut"

const FadeOutMeta: ComponentMeta<typeof View> = {
  title: "FadeOut"
}

export default FadeOutMeta

type FadeOutStory = ComponentStory<typeof View>

export const Basic: FadeOutStory = () => {
  const [tapped, setTapped] = useState(false)

  return (
  <SafeAreaProvider>
    <GestureHandlerRootView>
      <Title onPress={() => {setTapped(true)}}>Tap to fade out.</Title>

      <FadeOut
        trigger={tapped}
        onComplete={() => {}}
      />
    </GestureHandlerRootView>
  </SafeAreaProvider>
)}
