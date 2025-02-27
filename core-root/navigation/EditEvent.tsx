import { useCoreNavigation, useTiFNavigation } from "@components/Navigation"
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
import { StaticScreenProps } from "@react-navigation/native"
import { EventID } from "TiFShared/domain-models/Event"
import { useSetAtom } from "jotai"
import { StyleSheet } from "react-native"

type EditEventScreenProps = WithAlphaRegistrationProps<
  StaticScreenProps<RouteableEditEventFormValues & { id?: EventID }>
>

const EditEventScreen = withAlphaRegistration(
  ({ session, route }: EditEventScreenProps) => {
    const navigation = useTiFNavigation()
    const { pushEventDetails } = useCoreNavigation()
    return (
      <EditEventView
        eventId={route.params.id}
        initialValues={fromRouteableEditFormValues(route.params)}
        hostName={session.name}
        hostProfileImageURL={session.profileImageURL}
        onSelectLocationTapped={() => {
          navigation.navigate("modal", { screen: "editEventLocationSearch" })
        }}
        onSuccess={(e) => pushEventDetails(e.id, "replace")}
        style={styles.screen}
      />
    )
  }
)

const LocationSearchScreen = () => {
  const setLocation = useSetAtom(editEventFormValueAtoms.location)
  const navigation = useTiFNavigation()
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
  <EditEventFormDismissButton onDismiss={useTiFNavigation().goBack} />
)

export const editEventScreens = () => ({
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
