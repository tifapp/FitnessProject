import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React from "react"
import { View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { EnterMotivationScene } from "./Scene"

const EnterMotivationMeta: ComponentMeta<typeof View> = {
  title: "EnterMotivationPrototype"
}

export default EnterMotivationMeta

type EnterMotivationStory = ComponentStory<typeof View>

export const Basic: EnterMotivationStory = () => (
  <SafeAreaProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
    <View style={{width: "100%", height: "100%"}}> 
      <EnterMotivationScene color="#ffffff" goal="marathon runner" onComplete={() => { } } onStand={() => {console.log("Prompt completed")}} />
    </View>
    </GestureHandlerRootView>
  </SafeAreaProvider>
)
