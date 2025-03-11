import {
  BASE_HEADER_SCREEN_OPTIONS
} from "@components/Navigation"
import { EditEventView } from "@edit-event-boundary/CreateEvent"
import { EditEventFormDismissButton } from "@edit-event-boundary/Dismiss"
import { editEventFormValuesAtom } from "@edit-event-boundary/FormAtoms"
import { defaultEditFormValues } from "@event/EditFormValues"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { sleep } from "@lib/utils/DelayData"
import { GeocodingFunctionsProvider } from "@location/Geocoding"
import {
  LocationCoordinatesMocks,
  mockPlacemark
} from "@location/MockData"
import {
  NavigationContainer,
  NavigationProp,
  ParamListBase,
  useNavigation
} from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { SettingsProvider } from "@settings-storage/Hooks"
import { SQLiteLocalSettingsStorage } from "@settings-storage/LocalSettings"
import { PersistentSettingsStores } from "@settings-storage/PersistentStores"
import { SQLiteUserSettingsStorage } from "@settings-storage/UserSettings"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { testSQLite } from "@test-helpers/SQLite"
import { useAtomValue } from "jotai"
import React from "react"
import { Button, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"

const EditEventPragmaQuotesMeta = {
  title: "Edit Event Pragma Quotes"
}

export default EditEventPragmaQuotesMeta

const localStore = PersistentSettingsStores.local(
  new SQLiteLocalSettingsStorage(testSQLite)
)

const userStore = PersistentSettingsStores.user(
  new SQLiteUserSettingsStorage(testSQLite)
)

const Stack = createStackNavigator()

export const Basic = () => {
  return (
    <GeocodingFunctionsProvider>
      <TestQueryClientProvider>
        <GestureHandlerRootView>
          <BottomSheetModalProvider>
            <SafeAreaProvider>
              <NavigationContainer>
                <Stack.Navigator
                  screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}
                >
                  <Stack.Screen name="Settings" component={TestScreen} />
                  <Stack.Group screenOptions={{ presentation: "modal" }}>
                    <Stack.Screen
                      name="editEvent"
                      options={{ headerTitle: "", headerLeft: DismissButton }}
                      component={EditEventScreen}
                    />
                  </Stack.Group>
                </Stack.Navigator>
              </NavigationContainer>
            </SafeAreaProvider>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </TestQueryClientProvider>
    </GeocodingFunctionsProvider>
  )
}

const TestScreen = () => {
  const navigation: NavigationProp<ParamListBase> = useNavigation()
  const values = useAtomValue(editEventFormValuesAtom)
  return (
    <Button
      title="Edit Event"
      onPress={() => {
        console.log(defaultEditFormValues(), values)
        navigation.navigate("editEvent")
      }}
    />
  )
}

const DismissButton = () => {
  const navigation = useNavigation()
  return <EditEventFormDismissButton onDismiss={() => navigation.goBack()} />
}

const date = new Date("2024-10-30T00:00:00")

const placemark = mockPlacemark()
const coordinate = LocationCoordinatesMocks.SanFrancisco

const intialValues = {
  ...defaultEditFormValues(),
  title: "Blob",
  location: { coordinate, placemark }
}

const EditEventScreen = () => {
  const navigation = useNavigation()
  return (
    <View style={{ height: "100%" }}>
      <SettingsProvider
        userSettingsStore={userStore}
        localSettingsStore={localStore}
      >
        <EditEventView
          hostProfileImageURL="https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/13a3f4c3-cc99-40b2-ab5e-3d052a1e9286/width=450/00047-375332095-a%20_(xenoblade_),%201girl,%20%20_lora_A-v1.0-000020_0.4_1.4_.jpeg"
          initialValues={intialValues}
          submit={async (id, edit) => {
            await sleep(3000)
            throw new Error()
          }}
          onSuccess={(event) => {
            console.log("Edited", event)
            navigation.goBack()
          }}
          onSelectLocationTapped={() => console.log("Select Location")}
          currentDate={new Date("2024-10-31T00:00:00")}
          style={{ height: "100%" }}
        />
      </SettingsProvider>
    </View>
  )
}
