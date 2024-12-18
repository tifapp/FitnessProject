import { ChevronBackButton, XMarkBackButton } from "@components/Navigation"
import { Headline } from "@components/Text"
import {
  EventAttendeesListView,
  useEventAttendeesList
} from "@event-details-boundary/AttendeesList"
import { StaticScreenProps, useNavigation } from "@react-navigation/native"
import { EventID } from "TiFShared/domain-models/Event"
import { useEffect } from "react"

export const eventDetailsScreens = () => ({
  eventDetails: {
    options: { headerTitle: "Event" },
    screen: EventDetailsScreen
  },
  eventAttendeesList: {
    options: { headerLeft: ChevronBackButton, headerTitle: "Attendees" },
    screen: AttendeesListScreen
  }
})

type AttendeesListScreenProps = StaticScreenProps<{ id: EventID }>

const AttendeesListScreen = ({ route }: AttendeesListScreenProps) => {
  const navigation = useNavigation()
  return (
    <EventAttendeesListView
      state={useEventAttendeesList({ eventId: route.params.id })}
      onExploreOtherEventsTapped={() => navigation.navigate("home")}
    />
  )
}

type EventDetailsScreenProps = StaticScreenProps<{
  id: EventID
  method?: "navigate" | "replace"
}>

const EventDetailsScreen = ({ route }: EventDetailsScreenProps) => {
  const navigation = useNavigation()
  useEffect(() => {
    navigation.setOptions({
      headerLeft:
        route.params.method === "navigate" ? ChevronBackButton : XMarkBackButton
    })
  }, [route.params.method, navigation])
  return <Headline>TODO: I am the event details</Headline>
}
