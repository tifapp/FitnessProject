import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { SettingsProvider } from "@settings-storage/Hooks"
import { SQLiteLocalSettingsStorage } from "@settings-storage/LocalSettings"
import { PersistentSettingsStores } from "@settings-storage/PersistentStores"
import { SQLiteUserSettingsStorage } from "@settings-storage/UserSettings"
import { testSQLite } from "@test-helpers/SQLite"
import { RootSiblingParent } from "react-native-root-siblings"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { HelpAndSupportView } from "settings-boundary/HelpAndSupport"
import { StoryMeta } from "../../HelperTypes"

const SettingsMeta: StoryMeta = {
  title: "Settings Screen"
}

export default SettingsMeta

const Stack = createStackNavigator()

export const Basic = () => (
  <RootSiblingParent>
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}>
          <Stack.Screen name="Settings" component={Test} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  </RootSiblingParent>
)

const localStore = PersistentSettingsStores.local(
  new SQLiteLocalSettingsStorage(testSQLite)
)

const userStore = PersistentSettingsStores.user(
  new SQLiteUserSettingsStorage(testSQLite)
)

const Test = () => {
  return (
    <SettingsProvider
      localSettingsStore={localStore}
      userSettingsStore={userStore}
    >
      <HelpAndSupportView
        style={{ flex: 1 }}
        onViewHelpTapped={() => console.log("View Help")}
        onReportBugTapped={() => console.log("Report Bug")}
        onRequestFeatureTapped={() => console.log("Request Feature")}
      />
    </SettingsProvider>
  )
}
