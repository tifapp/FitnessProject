import { useNavigation, useRoute } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import EventDetails from "@screens/EventDetails/EventDetails"
import { EventDetailsScreenRouteProps } from "@stacks/ActivitiesStack"

export const EventDetailsScreenNavWrapper = () => {
  const { navigate } = useNavigation<StackNavigationProp<any>>()
  const { event } = useRoute<EventDetailsScreenRouteProps>().params

  return <EventDetails event={event} />
}
