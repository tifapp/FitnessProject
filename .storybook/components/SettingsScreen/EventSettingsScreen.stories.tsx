import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { EventSettingsView } from "@settings-boundary/EventSettings"
import { SQLiteLocalSettingsStorage } from "@settings-storage/LocalSettings"
import { PersistentSettingsStores } from "@settings-storage/PersistentStores"
import { SQLiteUserSettingsStorage } from "@settings-storage/UserSettings"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React from "react"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { BASE_HEADER_SCREEN_OPTIONS } from "../../../components/Navigation"
import { SettingsScreen } from "../../../screens/SettingsScreen/SettingsScreen"
import { SettingsProvider } from "../../../settings-storage/Hooks"
import { testSQLite } from "../../../test-helpers/SQLite"

const EventSettingsMeta: ComponentMeta<typeof SettingsScreen> = {
  title: "Event Settings Screen",
  component: SettingsScreen
}

export default EventSettingsMeta

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

const localStore = PersistentSettingsStores.local(
  new SQLiteLocalSettingsStorage(testSQLite)
)

const userStore = PersistentSettingsStores.user(
  new SQLiteUserSettingsStorage(testSQLite)
)

const Test = () => (
  <SafeAreaView edges={["bottom"]}>
    <SettingsProvider
      localSettingsStore={{} as any}
      userSettingsStore={userStore}
    >
      <EventSettingsView />
    </SettingsProvider>
  </SafeAreaView>
)
