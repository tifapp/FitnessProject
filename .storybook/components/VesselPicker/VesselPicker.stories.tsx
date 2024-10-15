import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React from "react"
import { View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Scene } from "./Scene"

const VesselPickerMeta: ComponentMeta<typeof View> = {
  title: "VesselPicker"
}

export default VesselPickerMeta

type VesselPickerStory = ComponentStory<typeof View>

export const Basic: VesselPickerStory = () => (
  <SafeAreaProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
    <View style={{ marginVertical: 50 }} />
    <View style={{width: "100%", height: "100%"}}> 
      <Scene />
    </View>
    </GestureHandlerRootView>
  </SafeAreaProvider>
)
