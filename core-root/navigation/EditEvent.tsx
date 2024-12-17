import {
  BASE_HEADER_SCREEN_OPTIONS,
  useCoreNavigation
} from "@components/Navigation"
import {
  withAlphaRegistration,
  WithAlphaRegistrationProps
} from "@core-root/AlphaRegister"
import { EditEventFormDismissButton } from "@edit-event-boundary/Dismiss"
import { EditEventView } from "@edit-event-boundary/EditEvent"
import { editEventFormValueAtoms } from "@edit-event-boundary/FormAtoms"
import {
  RouteableEditEventFormValues,
  fromRouteableEditFormValues
} from "@event/EditFormValues"
import {
  LocationsSearchView,
  useLocationsSearch
} from "@location-search-boundary"
import { useNavigation } from "@react-navigation/native"
import { StackScreenProps } from "@react-navigation/stack"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { EventID } from "TiFShared/domain-models/Event"
import { useSetAtom } from "jotai"
import { StyleSheet } from "react-native"
import { eventDetailsScreens } from "./EventDetails"

type EditEventScreenProps = WithAlphaRegistrationProps<
  StackScreenProps<
    { editEvent: RouteableEditEventFormValues & { id?: EventID } },
    "editEvent"
  >
>
const EditEventScreen = withAlphaRegistration(
  ({ session, route }: EditEventScreenProps) => {
    const navigation = useNavigation()
    const { pushEventDetails } = useCoreNavigation()
    return (
      <EditEventView
        eventId={route.params.id}
        initialValues={fromRouteableEditFormValues(route.params)}
        hostName={session.name}
        hostProfileImageURL={session.profileImageURL}
        onSelectLocationTapped={() => {
          navigation.navigate("editEventLocationSearch")
        }}
        onSuccess={(e) => pushEventDetails(e.id, "replace")}
        style={styles.screen}
      />
    )
  }
)

const LocationSearchScreen = () => {
  const setLocation = useSetAtom(editEventFormValueAtoms.location)
  const navigation = useNavigation()
  return (
    <LocationsSearchView
      state={useLocationsSearch()}
      onUserLocationSelected={(location) => {
        setLocation({ coordinate: location.coords, placemark: undefined })
        navigation.goBack()
      }}
      onLocationSelected={(location) => {
        setLocation(location)
        navigation.goBack()
      }}
    />
  )
}

const EditEventFormBackButton = () => (
  <EditEventFormDismissButton onDismiss={useNavigation().goBack} />
)

export const EditEventNavigator = createNativeStackNavigator({
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
    ...eventDetailsScreens()
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
