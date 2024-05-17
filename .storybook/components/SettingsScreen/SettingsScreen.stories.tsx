import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { HapticsProvider } from "@modules/tif-haptics"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import {
  AccountInfoSettingsView,
  AppearanceSettingsView,
  GeneralSettingsView,
  NotificationSettingsView,
  useAccountInfoSettings
} from "@settings-boundary"
import { SettingsProvider } from "@settings-storage/Hooks"
import { SQLiteLocalSettingsStorage } from "@settings-storage/LocalSettings"
import { PersistentSettingsStores } from "@settings-storage/PersistentStores"
import { SQLiteUserSettingsStorage } from "@settings-storage/UserSettings"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import { TestHaptics } from "@test-helpers/Haptics"
import { neverPromise } from "@test-helpers/Promise"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { testSQLite } from "@test-helpers/SQLite"
import { EmailAddress, USPhoneNumber } from "@user/privacy"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"

const SettingsMeta: ComponentMeta<typeof SettingsScreen> = {
  title: "Settings Screen",
  component: SettingsScreen
}

export default SettingsMeta

type SettingsStory = ComponentStory<typeof SettingsScreen>

const Stack = createStackNavigator()

export const Basic: SettingsStory = () => (
  <SafeAreaProvider>
    <HapticsProvider
      haptics={new TestHaptics()}
      isAudioSupportedOnDevice
      isFeedbackSupportedOnDevice
    >
      <TestQueryClientProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}>
            <Stack.Screen name="General" component={Test} />
          </Stack.Navigator>
        </NavigationContainer>
      </TestQueryClientProvider>
    </HapticsProvider>
  </SafeAreaProvider>
)

const localStore = PersistentSettingsStores.local(
  new SQLiteLocalSettingsStorage(testSQLite)
)

const userStore = PersistentSettingsStores.user(
  new SQLiteUserSettingsStorage(testSQLite)
)

const Test = () => {
  return (
    <SafeAreaView edges={["bottom"]}>
      <SettingsProvider
        localSettingsStore={localStore}
        userSettingsStore={userStore}
      >
        <GeneralSettingsView
          onClearCacheTapped={() => console.log("Clear Cache")}
        />
      </SettingsProvider>
    </SafeAreaView>
  )
}
