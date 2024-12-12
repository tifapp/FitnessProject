import {
  NavigationContainer,
  createStaticNavigation,
  useNavigation
} from "@react-navigation/native"
import { StackScreenProps, createStackNavigator } from "@react-navigation/stack"
import { StyleSheet, StyleProp, ViewStyle, View } from "react-native"
import React from "react"
import { HomeView } from "./Home"
import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { TiFContext, TiFContextValues } from "./Context"
import { TiFMenuProvider } from "@components/TiFMenuProvider"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { RootSiblingParent } from "react-native-root-siblings"
import { TiFQueryClientProvider } from "@lib/ReactQuery"
import {
  WithAlphaRegistrationProps,
  withAlphaRegistration
} from "./AlphaRegister"
import { EditEventView } from "@edit-event-boundary/EditEvent"
import {
  EditEventFormValues,
  RouteableEditEventFormValues,
  fromRouteableEditFormValues
} from "@event/EditFormValues"
import { EventID } from "TiFShared/domain-models/Event"
import { clientSideEventFromResponse } from "@event/ClientSideEvent"
import { EventMocks } from "@event-details-boundary/MockData"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import {
  EditEventFormDismissButton,
  useDismissEditEventForm
} from "@edit-event-boundary/Dismiss"
import { GestureHandlerRootView } from "react-native-gesture-handler"

const HomeScreen = withAlphaRegistration(() => (
  <HomeView style={styles.screen} />
))

type EditEventScreenProps = StackScreenProps<
  { editEvent: RouteableEditEventFormValues & { id?: EventID } },
  "editEvent"
>
const EditEventScreen = withAlphaRegistration(
  ({ session, route }: WithAlphaRegistrationProps<EditEventScreenProps>) => (
    <EditEventView
      eventId={route.params.id}
      initialValues={fromRouteableEditFormValues(route.params)}
      hostName={session.name}
      hostProfileImageURL={session.profileImageURL}
      submit={async (e, id) => ({
        status: "success",
        event: clientSideEventFromResponse(
          EventMocks.MockSingleAttendeeResponse
        )
      })}
      onSelectLocationTapped={() => console.log("Select Location")}
      onSuccess={(e) => console.log("Success", e)}
      style={styles.screen}
    />
  )
)

const BackButton = () => (
  <EditEventFormDismissButton onDismiss={useNavigation().goBack} />
)

const Stack = createStackNavigator({
  screenOptions: BASE_HEADER_SCREEN_OPTIONS,
  screens: {
    home: {
      options: { headerShown: false },
      screen: HomeScreen
    }
  },
  groups: {
    editEvent: {
      screenOptions: { presentation: "modal" },
      screens: {
        editEvent: {
          options: {
            headerTitle: "Edit Event",
            headerLeft: BackButton
          },
          screen: EditEventScreen
        },
        createEvent: {
          options: { headerTitle: "Create Event", headerLeft: BackButton },
          screen: EditEventScreen
        }
      }
    }
  }
})

const Navigation = createStaticNavigation(Stack)

const linking = { prefixes: ["tifapp://"] }

export type TiFProps = {
  isFontsLoaded: boolean
  style?: StyleProp<ViewStyle>
} & TiFContextValues

/**
 * The root view of the app.
 */
export const TiFView = ({ isFontsLoaded, style, ...props }: TiFProps) => {
  if (!isFontsLoaded) return null
  return (
    <GestureHandlerRootView>
      <TiFQueryClientProvider>
        <BottomSheetModalProvider>
          <SafeAreaProvider>
            <TiFMenuProvider>
              <RootSiblingParent>
                <View style={style}>
                  <TiFContext.Provider value={props}>
                    <Navigation linking={linking} />
                  </TiFContext.Provider>
                </View>
              </RootSiblingParent>
            </TiFMenuProvider>
          </SafeAreaProvider>
        </BottomSheetModalProvider>
      </TiFQueryClientProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1
  }
})
