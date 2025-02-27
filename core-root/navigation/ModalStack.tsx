import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { editEventScreens } from "./EditEvent"
import { eventDetailsScreens } from "./EventDetails"
import { helpAndSupportScreens } from "./Feedback"
import { profileScreens } from "./Profile"

export const ModalStack = createNativeStackNavigator({
  screenOptions: () => BASE_HEADER_SCREEN_OPTIONS,
  screens: {
    ...editEventScreens(),
    ...eventDetailsScreens(),
    ...profileScreens(),
    ...helpAndSupportScreens()
  }
})
