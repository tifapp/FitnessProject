import { EventFormValues } from "@components/eventForm"
import { dateRange } from "@lib/Date"
import { EventColors } from "@lib/events/EventColors"
import EventFormScreen from "@screens/EventFormScreen"
import {
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native"
import { captureAlerts } from "../../helpers/Alerts"
import {
  attemptDismiss,
  baseTestEventFormValues,
  editEventDescription,
  editEventTitle,
  moveEventEndDate,
  moveEventStartDate,
  pickEventColor,
  toggleShouldHideAfterStartDate
} from "../EventFormComponents/helpers"

const testLocation = { latitude: 45.0, longitude: -121.0 }

describe("EventFormScreen tests", () => {
  beforeEach(() => jest.resetAllMocks())

  it("should not be able to submit initial form content", () => {
    renderEventFormScreen(baseTestEventFormValues)
    expect(canSubmit()).toBeFalsy()
  })

  it("should be able to edit and submit a form with a preselected location", async () => {
    renderEventFormScreen({
      ...baseTestEventFormValues,
      locationInfo: { coordinates: testLocation }
    })
    moveEventStartDate(new Date(0))
    moveEventEndDate(new Date(1))
    toggleShouldHideAfterStartDate(false)
    editEventTitle("Test")
    editEventDescription("Hello world this is a test!")
    pickEventColor("Blue")
    submit()

    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test",
          description: "Hello world this is a test!",
          dateRange: dateRange(new Date(0), new Date(1)),
          color: EventColors.Blue,
          location: testLocation
        })
      )
    })
  })

  it("should present an error alert when a submission error occurs", async () => {
    submitAction.mockRejectedValue(new Error())
    renderEventFormScreen(baseTestEventFormValues)
    editEventTitle("Test")
    submit()

    await waitFor(() => expect(alertPresentationSpy).toHaveBeenCalled())
  })

  it("should be able to be dismissed", () => {
    renderEventFormScreen(baseTestEventFormValues)
    attemptDismiss()
    expect(dismissAction).toHaveBeenCalled()
  })

  it("gives a confirmation alert when attempting to dismiss after making edits to the form", () => {
    renderEventFormScreen(baseTestEventFormValues)
    toggleShouldHideAfterStartDate(true)
    editEventDescription("Hello world this is a test!")
    pickEventColor("Green")

    attemptDismiss()

    expect(dismissAction).not.toHaveBeenCalled()
    expect(alertPresentationSpy).toHaveBeenCalled()
  })
})

const { alertPresentationSpy } = captureAlerts()

const testSubmissionLabel = "Test Submit"

const submitAction = jest.fn()
const dismissAction = jest.fn()

const renderEventFormScreen = (values: EventFormValues) => {
  render(
    <EventFormScreen
      submissionLabel={testSubmissionLabel}
      initialValues={values}
      onSubmit={submitAction}
      onDismiss={dismissAction}
    />
  )
}

const submit = () => {
  fireEvent.press(screen.getByText(testSubmissionLabel))
}

const canSubmit = () => {
  return !screen.getByText(testSubmissionLabel).props.disabled
}
