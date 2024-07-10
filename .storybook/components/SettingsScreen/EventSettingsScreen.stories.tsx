import { StoryMeta } from ".storybook/HelperTypes"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { EventSettingsView } from "@settings-boundary/EventSettings"
import { SQLiteLocalSettingsStorage } from "@settings-storage/LocalSettings"
import { PersistentSettingsStores } from "@settings-storage/PersistentStores"
import { settingsSelector } from "@settings-storage/Settings"
import { SQLiteUserSettingsStorage } from "@settings-storage/UserSettings"
import { ComponentStory } from "@storybook/react-native"
import React from "react"
import { View } from "react-native"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { BASE_HEADER_SCREEN_OPTIONS } from "../../../components/Navigation"
import {
  SettingsProvider,
  useUserSettings
} from "../../../settings-storage/Hooks"
import { testSQLite } from "../../../test-helpers/SQLite"

const EventSettingsMeta: StoryMeta = {
  title: "Event Settings Screen",
  component: View
}

export default EventSettingsMeta

type SettingsStory = ComponentStory<typeof View>

const Stack = createStackNavigator()

export const Basic: SettingsStory = () => (
  <SafeAreaProvider>
    <SettingsProvider
      localSettingsStore={{} as any}
      userSettingsStore={userStore}
    >
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}>
          <Stack.Screen name="Event Settings" component={Test} />
        </Stack.Navigator>
      </NavigationContainer>
    </SettingsProvider>
  </SafeAreaProvider>
)

const localStore = PersistentSettingsStores.local(
  new SQLiteLocalSettingsStorage(testSQLite)
)

const userStore = PersistentSettingsStores.user(
  new SQLiteUserSettingsStorage(testSQLite)
)

const Test = () => {
  const { settings, update } = useUserSettings(
    settingsSelector("eventPresetDurations")
  )
  // useEffect(() => {
  //   update({ eventPresetDurations: [600, 4000] })
  // }, [])
  return (
    <SafeAreaView edges={["bottom"]}>
      <EventSettingsView
        onLocationPresetTapped={() => update({ eventPresetDurations: [] })}
      />
    </SafeAreaView>
  )
}
