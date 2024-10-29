import React from "react"
import { Button, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { Headline } from "@components/Text"

const RudeusEditorMeta = {
  title: "Rudeus Editor"
}

export default RudeusEditorMeta

export const Basic = () => {
  return (
    <GestureHandlerRootView>
      <View style={{ marginTop: 256, paddingHorizontal: 24, rowGap: 24 }}>
        <Headline>TODO</Headline>
      </View>
    </GestureHandlerRootView>
  )
}
