import { AppStyles } from "@lib/AppColorStyle"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React from "react"
import { View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { NarrationScene } from "./Scene"

const NarrationMeta: ComponentMeta<typeof View> = {
  title: "NarrationPrototype"
}

export default NarrationMeta

type NarrationStory = ComponentStory<typeof View>

export const Basic: NarrationStory = () => (
  <SafeAreaProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
    <View style={{width: "100%", height: "100%"}}> 
      <NarrationScene color={AppStyles.orange} onComplete={() => {}} />
    </View>
    </GestureHandlerRootView>
  </SafeAreaProvider>
)
