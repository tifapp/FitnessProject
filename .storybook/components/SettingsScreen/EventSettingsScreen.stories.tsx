import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { EventSettingsView } from "@settings-boundary"
import { SettingsProvider } from "@settings-storage/Hooks"
import {
  SQLiteUserSettingsStorage,
  userSettingsPersistentStore
} from "@settings-storage/UserSettings"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import { testSQLite } from "@test-helpers/SQLite"
import React from "react"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"

const SettingsMeta: ComponentMeta<typeof SettingsScreen> = {
  title: "Event Settings Screen",
  component: SettingsScreen
}

export default SettingsMeta

type SettingsStory = ComponentStory<typeof SettingsScreen>

const Stack = createStackNavigator()

export const Basic: SettingsStory = () => (
  <SafeAreaProvider>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}>
        <Stack.Screen name="Event Settings" component={Test} />
      </Stack.Navigator>
    </NavigationContainer>
  </SafeAreaProvider>
)

const store = userSettingsPersistentStore(
  new SQLiteUserSettingsStorage(testSQLite)
)

const Test = () => (
  <SafeAreaView edges={["bottom"]}>
    <SettingsProvider localSettingsStore={{} as any} userSettingsStore={store}>
      <EventSettingsView />
    </SettingsProvider>
  </SafeAreaView>
)
