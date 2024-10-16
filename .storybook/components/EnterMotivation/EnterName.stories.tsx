import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React from "react"
import { View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { EnterNameScene } from "./Scene"

const EnterNameMeta: ComponentMeta<typeof View> = {
  title: "EnterName"
}

export default EnterNameMeta

type EnterNameStory = ComponentStory<typeof View>

export const Basic: EnterNameStory = () => (
  <SafeAreaProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
    <View style={{width: "100%", height: "100%"}}> 
      <EnterNameScene onComplete={() => {}} />
    </View>
    </GestureHandlerRootView>
  </SafeAreaProvider>
)
