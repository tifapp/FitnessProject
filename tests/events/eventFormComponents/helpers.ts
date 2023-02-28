import { FixedDateRange } from "@lib/Date"
import { EventColors } from "@lib/events/EventColors"
import { fireEvent, screen } from "@testing-library/react-native"
import { updateDateTimePickerDate } from "../../helpers/DateTimePicker"

export const baseTestEventValues = {
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

export const editEventTitle = (title: string) => {
  fireEvent.changeText(screen.getByPlaceholderText("Title"), title)
}

export const editEventDescription = (description: string) => {
  fireEvent.changeText(screen.getByPlaceholderText("Description"), description)
}

export const moveEventStartDate = (date: Date) => {
  fireEvent.press(dateToolbarButton())
  updateDateTimePickerDate({
    testID: "eventFormStartDateTimePicker",
    toDate: date
  })
  fireEvent.press(closeToolbarButton())
}

export const moveEventEndDate = (date: Date) => {
  fireEvent.press(dateToolbarButton())
  updateDateTimePickerDate({
    testID: "eventFormEndDateTimePicker",
    toDate: date
  })
  fireEvent.press(closeToolbarButton())
}

export const pickEventColor = (colorName: string) => {
  fireEvent.press(screen.getByLabelText("Pick Color"))
  fireEvent.press(screen.getByLabelText(colorName))
  fireEvent.press(closeToolbarButton())
}

export const toggleShouldHideAfterStartDate = () => {
  fireEvent.press(screen.getByLabelText("More Settings"))
  fireEvent(
    screen.getByTestId("eventFormShouldHideAfterStartDateSwitch"),
    "valueChange",
    true
  )
  fireEvent.press(closeToolbarButton())
}

const dateToolbarButton = () => screen.getByLabelText("Update Dates")
const closeToolbarButton = () => screen.getByLabelText("Close")
