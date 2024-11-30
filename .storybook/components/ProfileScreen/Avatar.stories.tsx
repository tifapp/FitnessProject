import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { View } from "react-native"
import { StoryMeta } from "../../../.storybook/HelperTypes"
import { ComponentStory } from "../../../.storybook/components"
import { AvatarView } from "../../../components/Avatar"
import { BASE_HEADER_SCREEN_OPTIONS } from "../../../components/Navigation"
import { EventAttendeeMocks } from "../../../event-details-boundary/MockData"

const ProfileMeta: StoryMeta = {
  title: "Profile Screen"
}
export default ProfileMeta

type ProfileStory = ComponentStory<typeof AvatarView>

const Stack = createStackNavigator()

export const Basic: ProfileStory = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="avatarDisplay"
      screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}
    >
      <Stack.Screen name="avatar" component={AvatarTestScreen} />
    </Stack.Navigator>
  </NavigationContainer>
)

const AvatarTestScreen = () => {
  const testValue = {
    name: EventAttendeeMocks.Alivs.name
  }
  return (
    <View>
      <AvatarView name={testValue.name} />
    </View>
  )
}
