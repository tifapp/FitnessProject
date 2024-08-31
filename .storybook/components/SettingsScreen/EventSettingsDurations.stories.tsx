import { StoryMeta } from ".storybook/HelperTypes"
import { PrimaryButton } from "@components/Buttons"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { SQLiteLocalSettingsStorage } from "@settings-storage/LocalSettings"
import { PersistentSettingsStores } from "@settings-storage/PersistentStores"
import { settingsSelector } from "@settings-storage/Settings"
import { SQLiteUserSettingsStorage } from "@settings-storage/UserSettings"
import { ComponentStory } from "@storybook/react-native"
import { useAtom } from "jotai"
import React from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import {
  EditModeButton,
  EventDurationView,
  eventSettingsEditMode
} from "settings-boundary/EventSettings"
import { BASE_HEADER_SCREEN_OPTIONS } from "../../../components/Navigation"
import {
  SettingsProvider,
  useUserSettings
} from "../../../settings-storage/Hooks"
import { testSQLite } from "../../../test-helpers/SQLite"

const EventSettingsDurationMeta: StoryMeta = {
  title: "Durations Screen",
  component: View
}

export default EventSettingsDurationMeta

type SettingsStory = ComponentStory<typeof View>

const Stack = createStackNavigator()

export const Basic: SettingsStory = () => {
  return (
    <SafeAreaProvider>
      <SettingsProvider
        localSettingsStore={{} as any}
        userSettingsStore={userStore}
      >
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              ...BASE_HEADER_SCREEN_OPTIONS,
              headerRight: () => {
                return <EditModeButton />
              }
            }}
          >
            <Stack.Screen
              name="Duration Presets"
              component={DurationScreenTest}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SettingsProvider>
    </SafeAreaProvider>
  )
}

const localStore = PersistentSettingsStores.local(
  new SQLiteLocalSettingsStorage(testSQLite)
)

const userStore = PersistentSettingsStores.user(
  new SQLiteUserSettingsStorage(testSQLite)
)

const DurationScreenTest = () => {
  const { settings, update } = useUserSettings(
    settingsSelector("eventPresetDurations")
  )
  return (
    <SafeAreaView edges={["bottom"]}>
      <PrimaryButton
        title="Add Test Buttons"
        onPress={() =>
          update({ eventPresetDurations: [600, 1200, 1800, 2400, 4800, 7200] })
        }
      />
      <EventDurationView />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  editModePadding: { left: 16 }
})
