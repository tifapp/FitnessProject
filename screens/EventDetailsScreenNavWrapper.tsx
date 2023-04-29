import EventDetails from "@components/eventDetails/EventDetails"
import { useNavigation, useRoute } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { EventDetailsScreenRouteProps } from "@stacks/ActivitiesStack"

export const EventDetailsScreenNavWrapper = () => {
  const { navigate } = useNavigation<StackNavigationProp<any>>()
  const params = useRoute<EventDetailsScreenRouteProps>().params
  console.log(params)
  return <EventDetails event={null} />
}
