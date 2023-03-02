import {
  EventForm,
  EventFormSubmitButton,
  EventFormTitleField,
  EventFormValues
} from "@components/eventForm"
import {
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native"
import { neverPromise } from "../../helpers/Promise"
import "../../helpers/Matchers"
import { baseTestEventFormValues, editEventTitle } from "./helpers"
import { EventColors } from "@lib/events/EventColors"
import { captureAlerts } from "../../helpers/Alerts"

const submitAction = jest.fn()

describe("EventFormSubmitButton tests", () => {
  it("should be disbaled when event has not been edited", () => {
    renderSubmitButton(baseTestEventFormValues)
    expect(submitButton()).not.toBeEnabled()
  })

  it("should be disabled when event has an empty title", () => {
    renderSubmitButton({ ...baseTestEventFormValues, title: "" })
    expect(submitButton()).not.toBeEnabled()
  })

  it("should be disabled when event has no location", () => {
    renderSubmitButton({ ...baseTestEventFormValues, locationInfo: undefined })
    expect(submitButton()).not.toBeEnabled()
  })

  it("should be disabled when submitting", async () => {
    submitAction.mockImplementation(neverPromise)
    renderSubmitButton(baseTestEventFormValues)
    editEventTitle(editedEventTitle)
    submit()
    await waitFor(() => expect(submitButton()).not.toBeEnabled())
  })

  it("should parse the current event values into an update input on submission", async () => {
    renderSubmitButton(baseTestEventFormValues)
    editEventTitle(editedEventTitle)
    submit()
    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledWith({
        title: editedEventTitle,
        description: baseTestEventFormValues.description,
        location: baseTestEventFormValues.locationInfo.coordinates,
        color: EventColors.Red,
        dateRange: baseTestEventFormValues.dateRange,
        shouldHideAfterStartDate: false,
        radiusMeters: 0
      })
    })
  })

  it("should make the description undefined when empty in submitted update input", async () => {
    renderSubmitButton({ ...baseTestEventFormValues, description: "" })
    editEventTitle(editedEventTitle)
    submit()
    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledWith(
        expect.objectContaining({ description: undefined })
      )
    })
  })

  it("should re-enable submissions after submission finishes", async () => {
    submitAction.mockImplementation(Promise.resolve)
    renderSubmitButton(baseTestEventFormValues)
    editEventTitle(editedEventTitle)
    submit()
    await waitFor(() => expect(submitButton()).toBeEnabled())
  })

  it("should present an error alert when something goes wrong with the submission", async () => {
    submitAction.mockRejectedValue(new Error("lmao"))
    renderSubmitButton(baseTestEventFormValues)
    editEventTitle(editedEventTitle)
    submit()
    await waitFor(() => expect(alertPresentationSpy).toHaveBeenCalled())
  })
})

const { alertPresentationSpy } = captureAlerts()

const editedEventTitle = "Updated Event"

const testButtonLabel = "Test Submit"

const renderSubmitButton = (values: EventFormValues) => {
  render(
    <EventForm initialValues={values} onSubmit={submitAction}>
      <EventFormTitleField />
      <EventFormSubmitButton label={testButtonLabel} />
    </EventForm>
  )
}

const submit = () => {
  fireEvent.press(submitButton())
}

const submitButton = () => {
  return screen.getByText(testButtonLabel)
}
