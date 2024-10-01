import React, { useState } from "react"
import { Button, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import {
  PragmaQuoteView,
  createEventQuote
} from "@edit-event-boundary/PragmaQuotes"
import { Provider, atom, useAtomValue } from "jotai"
import { EditEventView } from "@edit-event-boundary/EditEvent"
import {
  DEFAULT_EDIT_EVENT_FORM_VALUES,
  editEventFormValuesAtom
} from "@edit-event-boundary/FormValues"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { SQLiteLocalSettingsStorage } from "@settings-storage/LocalSettings"
import { PersistentSettingsStores } from "@settings-storage/PersistentStores"
import { SQLiteUserSettingsStorage } from "@settings-storage/UserSettings"
import { testSQLite } from "@test-helpers/SQLite"
import { SettingsProvider } from "@settings-storage/Hooks"
import {
  NavigationContainer,
  NavigationProp,
  ParamListBase,
  useNavigation
} from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import {
  BASE_HEADER_SCREEN_OPTIONS,
  XMarkBackButton
} from "@components/Navigation"
import { EditEventFormDismissButton } from "@edit-event-boundary/Dismiss"

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
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}>
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
    </GestureHandlerRootView>
  )
}

const TestScreen = () => {
  const navigation: NavigationProp<ParamListBase> = useNavigation()
  const values = useAtomValue(editEventFormValuesAtom)
  return (
    <Button
      title="Edit Event"
      onPress={() => {
        console.log(DEFAULT_EDIT_EVENT_FORM_VALUES, values)
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

const EditEventScreen = () => {
  return (
    <View style={{ height: "100%" }}>
      <SettingsProvider
        userSettingsStore={userStore}
        localSettingsStore={localStore}
      >
        <EditEventView
          initialValues={{ ...DEFAULT_EDIT_EVENT_FORM_VALUES, title: "Blob" }}
          currentDate={new Date("2024-10-31T00:00:00")}
          style={{ height: "100%" }}
        />
      </SettingsProvider>
    </View>
  )
}
