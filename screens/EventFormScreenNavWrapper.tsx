import { useNavigation, useRoute } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { EventFormScreenRouteProps } from "@stacks/ActivitiesStack"
import EventFormScreen from "./EventFormScreen"

export const EventFormScreenNavWrapper = () => {
  const { navigate } = useNavigation<StackNavigationProp<any>>()
  const { initialValues, submissionLabel, onSubmit, onDismiss } =
    useRoute<EventFormScreenRouteProps>().params
  return (
    <EventFormScreen
      initialValues={initialValues}
      submissionLabel={submissionLabel}
      onSubmit={onSubmit}
      onDismiss={onDismiss}
    />
  )
}
