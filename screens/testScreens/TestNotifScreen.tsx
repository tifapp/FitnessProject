import { Headline } from "@components/Text"
import React, { Button, View } from "react-native"

export const TestNotifScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignSelf: "center"
      }}
    >
      <Headline>Test Notification Screen</Headline>
    </View>
  )
}
