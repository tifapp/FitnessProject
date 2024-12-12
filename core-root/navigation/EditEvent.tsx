import {
  BASE_HEADER_SCREEN_OPTIONS,
  XMarkBackButton
} from "@components/Navigation"
import { useScreenBottomPadding } from "@components/Padding"
import { Headline } from "@components/Text"
import {
  withAlphaRegistration,
  WithAlphaRegistrationProps
} from "@core-root/AlphaRegister"
import { EditEventFormDismissButton } from "@edit-event-boundary/Dismiss"
import { EditEventView } from "@edit-event-boundary/EditEvent"
import { editEventFormValueAtoms } from "@edit-event-boundary/FormAtoms"
import { EventMocks } from "@event-details-boundary/MockData"
import { clientSideEventFromResponse } from "@event/ClientSideEvent"
import {
  RouteableEditEventFormValues,
  fromRouteableEditFormValues
} from "@event/EditFormValues"
import {
  LocationSearchBar,
  LocationSearchPicker,
  useLocationSearchPicker
} from "@location-search-boundary"
import { useNavigation } from "@react-navigation/native"
import { StackScreenProps, createStackNavigator } from "@react-navigation/stack"
import { EventID } from "TiFShared/domain-models/Event"
import { repeatElements } from "TiFShared/lib/Array"
import { useSetAtom } from "jotai"
import { mockLocationSearchResult } from "location-search-boundary/MockData"
import { useState } from "react"
import { StyleSheet, Platform, View, LayoutRectangle } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

type EditEventScreenProps = WithAlphaRegistrationProps<
  StackScreenProps<
    { editEvent: RouteableEditEventFormValues & { id?: EventID } },
    "editEvent"
  >
>
const EditEventScreen = withAlphaRegistration(
  ({ session, route }: EditEventScreenProps) => {
    const navigation = useNavigation()
    return (
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
        onSelectLocationTapped={() => {
          navigation.navigate("editEventLocationSearch")
        }}
        onSuccess={(e) => {
          navigation.replace("editEventDetails", { id: e.id })
        }}
        style={styles.screen}
      />
    )
  }
)

const LocationSearchScreen = () => {
  const setLocation = useSetAtom(editEventFormValueAtoms.location)
  const picker = useLocationSearchPicker({
    loadSearchResults: async () =>
      repeatElements(20, () => mockLocationSearchResult())
  })
  const [headerLayout, setHeaderLayout] = useState<
    LayoutRectangle | undefined
  >()
  const navigation = useNavigation()
  const safeAreaEdges =
    Platform.OS === "android" ? undefined : (["bottom"] as const)
  const padding = useScreenBottomPadding({
    safeAreaScreens: (headerLayout?.height ?? 0) + 24,
    nonSafeAreaScreens: 24
  })
  return (
    <SafeAreaView edges={safeAreaEdges}>
      <View onLayout={(e) => setHeaderLayout(e.nativeEvent.layout)}>
        <LocationSearchBar
          onBackTapped={navigation.goBack}
          placeholder="Enter a Location"
          style={styles.locationSearchBarHeaderSpacing}
        />
      </View>
      <LocationSearchPicker
        {...picker}
        savePickedLocation={async () => {}}
        onUserLocationSelected={(location) => {
          setLocation({ coordinate: location.coords, placemark: undefined })
          navigation.goBack()
        }}
        onLocationSelected={(location) => {
          setLocation(location)
          navigation.goBack()
        }}
        contentContainerStyle={{ paddingBottom: padding }}
        style={styles.locationSearchPicker}
      />
    </SafeAreaView>
  )
}

const EditEventFormBackButton = () => (
  <EditEventFormDismissButton onDismiss={useNavigation().goBack} />
)

const EditEventDetailsScreen = () => {
  return <Headline>TODO: I am the event details</Headline>
}

export const EditEventNavigator = createStackNavigator({
  screenOptions: BASE_HEADER_SCREEN_OPTIONS,
  screens: {
    editEventForm: {
      options: {
        headerTitle: "Edit Event",
        headerLeft: EditEventFormBackButton
      },
      screen: EditEventScreen
    },
    createEventForm: {
      options: {
        headerTitle: "Create Event",
        headerLeft: EditEventFormBackButton
      },
      screen: EditEventScreen
    },
    editEventLocationSearch: {
      options: { headerShown: false },
      screen: LocationSearchScreen
    },
    editEventDetails: {
      options: { headerLeft: XMarkBackButton, headerTitle: "Event" },
      screen: EditEventDetailsScreen
    }
  }
})

const styles = StyleSheet.create({
  screen: { flex: 1 },
  locationSearchPicker: { height: "100%", paddingTop: 16 },
  locationSearchBarHeaderSpacing: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8
  }
})
