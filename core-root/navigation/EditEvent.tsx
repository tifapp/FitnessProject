import { useCoreNavigation, useTiFNavigation } from "@components/Navigation"
import {
  withAlphaRegistration,
  WithAlphaRegistrationProps
} from "@core-root/AlphaRegister"
import { CreateEventView } from "@edit-event-boundary/CreateEvent"
import { EditEventFormDismissButton } from "@edit-event-boundary/Dismiss"
import { EditEventView } from "@edit-event-boundary/EditEvent"
import { editEventFormValueAtoms } from "@edit-event-boundary/FormAtoms"
import {
  fromRouteableEditFormValues,
  RouteableEditEventFormValues
} from "@event/EditFormValues"
import {
  LocationsSearchView,
  useLocationsSearch
} from "@location-search-boundary"
import { StaticScreenProps } from "@react-navigation/native"
import { EventID } from "TiFShared/domain-models/Event"
import { useAtom, useSetAtom } from "jotai"
import { StyleSheet } from "react-native"

type EditEventScreenProps = WithAlphaRegistrationProps<
  StaticScreenProps<RouteableEditEventFormValues & { id?: EventID }>
>

const EditEventScreen = withAlphaRegistration(
  ({ session, route }: EditEventScreenProps) => {
    const navigation = useTiFNavigation()
    const [location, setLocation] = useAtom(editEventFormValueAtoms.location)
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
        onMapLongPress={(e) =>
          setLocation({
            placemark: undefined,
            coordinate: e.nativeEvent.coordinate
          })
        }
        onSuccess={(e) => pushEventDetails(e.id, "replace")}
        style={styles.screen}
      />
    )
  }
)

const CreateEventScreen = withAlphaRegistration(
  ({ session, route }: EditEventScreenProps) => {
    const navigation = useTiFNavigation()
    const { pushEventDetails } = useCoreNavigation()
    const [location, setLocation] = useAtom(editEventFormValueAtoms.location)
    return (
      <CreateEventView
        eventId={route.params.id}
        initialValues={fromRouteableEditFormValues(route.params)}
        hostName={session.name}
        hostProfileImageURL={session.profileImageURL}
        onMapLongPress={(e) =>
          setLocation({
            placemark: undefined,
            coordinate: e.nativeEvent.coordinate
          })
        }
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
      headerTitle: "Change Your Adventure",
      headerLeft: EditEventFormBackButton
    },
    screen: EditEventScreen
  },
  createEventForm: {
    options: {
      headerTitle: "Chart Your Next Adventure",
      headerLeft: EditEventFormBackButton,
      headerStyle: {
        backgroundColor: "black"
      },
      headerTintColor: "#fff"
    },
    screen: CreateEventScreen
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
