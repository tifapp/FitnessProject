import { Headline } from "@components/Text"
import { useNavigation } from "@react-navigation/native"
import React, { Button, View } from "react-native"

export const TestProfileScreen = () => {
  const navigation = useNavigation()
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignSelf: "center"
      }}
    >
      <Headline>Test Button to head to Settings</Headline>
      <Button
        title="Settings"
        onPress={() => navigation.navigate("Settings Screen")}
      />
    </View>
  )
}
