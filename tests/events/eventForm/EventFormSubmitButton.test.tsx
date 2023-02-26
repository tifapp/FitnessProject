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
import { baseTestEventValues, editEventFormTitle } from "./helpers"
import { EventColors } from "@lib/events/EventColors"

const submitAction = jest.fn()

describe("EventFormSubmitButton tests", () => {
  it("should be disbaled when event has not been edited", () => {
    renderSubmitButton(baseTestEventValues)
    expect(submitButton()).not.toBeEnabled()
  })

  it("should be enabled when valid event", () => {
    renderSubmitButton(baseTestEventValues)
    editEventFormTitle(editedEventTitle)
    expect(submitButton()).toBeEnabled()
  })

  it("should be disabled when event has an empty title", () => {
    renderSubmitButton({ ...baseTestEventValues, title: "" })
    expect(submitButton()).not.toBeEnabled()
  })

  it("should be disabled when event has no location", () => {
    renderSubmitButton({ ...baseTestEventValues, locationInfo: undefined })
    expect(submitButton()).not.toBeEnabled()
  })

  it("should be disabled when submitting", async () => {
    submitAction.mockImplementation(neverPromise)
    renderSubmitButton(baseTestEventValues)
    editEventFormTitle(editedEventTitle)
    submit()
    await waitFor(() => expect(submitButton()).not.toBeEnabled())
  })

  it("should parse the current event values into an update input on submission", async () => {
    renderSubmitButton(baseTestEventValues)
    editEventFormTitle(editedEventTitle)
    submit()
    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledWith({
        title: editedEventTitle,
        description: baseTestEventValues.description,
        location: baseTestEventValues.locationInfo.coordinates,
        color: EventColors.Red,
        dateRange: baseTestEventValues.dateRange,
        shouldHideAfterStartDate: false,
        radiusMeters: 0
      })
    })
  })

  it("should make the description undefined when empty in submitted update input", async () => {
    renderSubmitButton({ ...baseTestEventValues, description: "" })
    editEventFormTitle(editedEventTitle)
    submit()
    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledWith(
        expect.objectContaining({ description: undefined })
      )
    })
  })

  it("should re-enable submissions after submission finishes", async () => {
    submitAction.mockImplementation(Promise.resolve)
    renderSubmitButton(baseTestEventValues)
    editEventFormTitle(editedEventTitle)
    submit()
    await waitFor(() => expect(submitButton()).toBeEnabled())
  })
})

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
