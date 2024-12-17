import { ChevronBackButton, XMarkBackButton } from "@components/Navigation"
import { Headline } from "@components/Text"
import {
  EventAttendeesListView,
  useEventAttendeesList
} from "@event-details-boundary/AttendeesList"
import { useNavigation } from "@react-navigation/native"
import { StackScreenProps } from "@react-navigation/stack"
import { EventID } from "TiFShared/domain-models/Event"

export const eventDetailsScreens = () => ({
  eventDetails: {
    options: { headerLeft: XMarkBackButton, headerTitle: "Event" },
    screen: EditEventDetailsScreen
  },
  eventAttendeesList: {
    options: { headerLeft: ChevronBackButton, headerTitle: "Attendees" },
    screen: AttendeesListScreen
  }
})

type AttendeesListScreenProps = StackScreenProps<
  { eventDetails: { id: EventID } },
  "eventDetails"
>
const AttendeesListScreen = ({ route }: AttendeesListScreenProps) => {
  const navigation = useNavigation()
  return (
    <EventAttendeesListView
      state={useEventAttendeesList({ eventId: route.params.id })}
      onExploreOtherEventsTapped={() => navigation.navigate("home")}
    />
  )
}

const EditEventDetailsScreen = () => {
  return <Headline>TODO: I am the event details</Headline>
}
