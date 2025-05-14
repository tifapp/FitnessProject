import { useBackButton, useTiFNavigation } from "@components/Navigation"
import {
  EventAttendeesListView,
  useEventAttendeesList
} from "@event-details-boundary/AttendeesList"
import { EventDetailsContentView } from "@event-details-boundary/Content"
import { EventDetailsView } from "@event-details-boundary/Details"
import { useLoadEventDetails } from "@event/DetailsQuery"
import { StaticScreenProps } from "@react-navigation/native"
import { EventID } from "TiFShared/domain-models/Event"

export const eventDetailsScreens = () => ({
  eventDetails: {
    options: () => ({ headerTitle: "Event" }),
    screen: EventDetailsScreen
  },
  eventAttendeesList: {
    options: { headerTitle: "Attendees" },
    screen: AttendeesListScreen
  }
})

type AttendeesListScreenProps = StaticScreenProps<{ id: EventID }>

const AttendeesListScreen = ({ route }: AttendeesListScreenProps) => {
  const navigation = useTiFNavigation()
  useBackButton()
  return (
    <EventAttendeesListView
      state={useEventAttendeesList({ eventId: route.params.id })}
      onExploreOtherEventsTapped={() => navigation.navigate("home")}
    />
  )
}

type EventDetailsScreenProps = StaticScreenProps<{ id: EventID }>

const EventDetailsScreen = ({ route }: EventDetailsScreenProps) => {
  const navigation = useTiFNavigation()
  useBackButton()
  return (
    <EventDetailsContentView
      result={useLoadEventDetails(route.params.id)}
      onExploreOtherEventsTapped={() => navigation.navigate("home")}
    >
      {(state) => <EventDetailsView state={state} />}
    </EventDetailsContentView>
  )
}
