import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React from "react"
import { View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { EnterGoalScene } from "./Scene"

const EnterGoalMeta: ComponentMeta<typeof View> = {
  title: "EnterGoalPrototype"
}

export default EnterGoalMeta

type EnterGoalStory = ComponentStory<typeof View>

export const Basic: EnterGoalStory = () => (
  <SafeAreaProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
    <View style={{width: "100%", height: "100%"}}> 
      <EnterGoalScene onComplete={() => {}} />
    </View>
    </GestureHandlerRootView>
  </SafeAreaProvider>
)
