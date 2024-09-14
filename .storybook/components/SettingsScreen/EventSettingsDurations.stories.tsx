import { StoryMeta } from ".storybook/HelperTypes"
import { PrimaryButton } from "@components/Buttons"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { SQLiteLocalSettingsStorage } from "@settings-storage/LocalSettings"
import { PersistentSettingsStores } from "@settings-storage/PersistentStores"
import { settingsSelector } from "@settings-storage/Settings"
import { SQLiteUserSettingsStorage } from "@settings-storage/UserSettings"
import { ComponentStory } from "@storybook/react-native"
import React from "react"
import { SafeAreaView, StyleSheet, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import {
  DurationSettingsEditModeButton,
  EventDurationView
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

export const Basic: SettingsStory = () => (
  <SafeAreaProvider>
    <GestureHandlerRootView>
      <BottomSheetModalProvider>
        <SettingsProvider
          localSettingsStore={{} as any}
          userSettingsStore={userStore}
        >
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                ...BASE_HEADER_SCREEN_OPTIONS,
                headerRight: () => {
                  return <DurationSettingsEditModeButton />
                }
              }}
            >
              <Stack.Screen name="Durations" component={DurationScreenTest} />
            </Stack.Navigator>
          </NavigationContainer>
        </SettingsProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  </SafeAreaProvider>
)

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
      {/* <TimePickerView
        initialDuration={0}
        onDurationChange={() => console.log("Blah")}
        style={{ width: "100%", height: 400 }}
      /> */}
      <EventDurationView />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  editModePadding: { left: 16 }
})
