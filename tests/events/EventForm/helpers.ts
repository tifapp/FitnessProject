import { FixedDateRange } from "@lib/Date"
import { EventColors } from "@lib/events"
import { fireEvent, screen } from "@testing-library/react-native"
import { setDateTimePickerDate } from "../../helpers/DateTimePicker"

export const baseTestEventFormValues = {
  title: "Test Event",
  description: "Hello world this is a test",
  locationInfo: {
    coordinates: { latitude: 45.123456, longitude: 45.123456 },
    placemarkInfo: {
      name: "Test",
      address: "1234 Test Dr, TestCity, TestState 12345"
    }
  },
  dateRange: new FixedDateRange(
    new Date("2023-02-23T00:17:00"),
    new Date("2023-02-23T00:19:00")
  ),
  color: EventColors.Red,
  shouldHideAfterStartDate: false,
  radiusMeters: 0
} as const

/**
 * Simulates editing the event title when an `EventFormTitleField` exists.
 */
export const editEventTitle = (title: string) => {
  fireEvent.changeText(screen.getByPlaceholderText("Title"), title)
}

/**
 * Simulates editing the event description when an `EventFormDescriptionField` exists.
 */
export const editEventDescription = (description: string) => {
  fireEvent.changeText(screen.getByPlaceholderText("Description"), description)
}

/**
 * Simulates moving the event start date when an `EventFormToolbar` exists.
 */
export const moveEventStartDate = (date: Date) => {
  fireEvent.press(dateToolbarButton())
  setDateTimePickerDate({
    testID: "eventFormStartDate",
    toDate: date
  })
  dismissToolbarModal()
}

/**
 * Simulates moving the event end date when an `EventFormToolbar` exists.
 */
export const moveEventEndDate = (date: Date) => {
  fireEvent.press(dateToolbarButton())
  setDateTimePickerDate({
    testID: "eventFormEndDate",
    toDate: date
  })
  dismissToolbarModal()
}

/**
 * Simulates picking the event color when an `EventFormToolbar` exists.
 *
 * @param colorName the accessibility name of the color (eg. "Red" for EventColor.Red)
 */
export const pickEventColor = (colorName: string) => {
  fireEvent.press(screen.getByText("Color"))
  fireEvent.press(screen.getByLabelText(colorName))
  dismissToolbarModal()
}

/**
 * Simulates toggling the option to hide the event after it starts when
 * an `EventFormToolbar` exists.
 */
export const toggleShouldHideAfterStartDate = (value: boolean) => {
  fireEvent.press(screen.getByLabelText("Advanced Settings"))
  fireEvent(screen.getByRole("togglebutton"), "valueChange", value)
  dismissToolbarModal()
}

/**
 * Simulates a user tapping on the dismiss button.
 */
export const attemptDismiss = () => {
  fireEvent.press(screen.getByLabelText("Cancel"))
}

const dateToolbarButton = () => screen.getByLabelText("Update Dates")
const dismissToolbarModal = () => {
  fireEvent.press(screen.getByLabelText("Close Section"))
}
