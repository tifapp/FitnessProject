import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { delayData } from "@lib/utils/DelayData"
import { HapticsProvider } from "@modules/tif-haptics"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { BlockListSettingsView, useBlockListSettings } from "@settings-boundary"
import { SettingsProvider } from "@settings-storage/Hooks"
import { SQLiteLocalSettingsStorage } from "@settings-storage/LocalSettings"
import { PersistentSettingsStores } from "@settings-storage/PersistentStores"
import { SQLiteUserSettingsStorage } from "@settings-storage/UserSettings"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import { TestHaptics } from "@test-helpers/Haptics"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { testSQLite } from "@test-helpers/SQLite"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { mockBlockListPage } from "settings-boundary/MockData"
import { RootSiblingParent } from "react-native-root-siblings"

const SettingsMeta: ComponentMeta<typeof SettingsScreen> = {
  title: "Settings Screen",
  component: SettingsScreen
}

export default SettingsMeta

type SettingsStory = ComponentStory<typeof SettingsScreen>

const Stack = createStackNavigator()

export const Basic: SettingsStory = () => (
  <RootSiblingParent>
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
  </RootSiblingParent>
)

const localStore = PersistentSettingsStores.local(
  new SQLiteLocalSettingsStorage(testSQLite)
)

const userStore = PersistentSettingsStores.user(
  new SQLiteUserSettingsStorage(testSQLite)
)

const Test = () => {
  const state = useBlockListSettings({
    nextPage: async () => {
      return await delayData(mockBlockListPage(10, null), 3000)
    },
    unblockUsers: async (ids) => console.log("Unblocking", ids),
    unblockDebounceMillis: 2000
  })
  console.log(state.users)
  return (
    <SafeAreaView edges={["bottom"]}>
      <SettingsProvider
        localSettingsStore={localStore}
        userSettingsStore={userStore}
      >
        <BlockListSettingsView
          state={state}
          onUserProfileTapped={(id) => console.log("User tapped", id)}
        />
      </SettingsProvider>
    </SafeAreaView>
  )
}
