import { EventFormValues } from "@components/eventForm"
import EventForm from "@components/eventForm/EventForm"
import EventFormSubmitButton from "@components/eventForm/EventFormSubmitButton"
import {
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native"
import { neverPromise } from "../../helpers/Promise"
import "../../helpers/Matchers"
import { baseTestEventValues } from "./helpers"
import { EventColors } from "@lib/events/EventColors"

const submitAction = jest.fn()

describe("EventFormSubmitButton tests", () => {
  it("should be enabled when valid event", () => {
    renderSubmitButton(baseTestEventValues)
    expect(button()).toBeEnabled()
  })

  it("should be disabled when event has an empty title", () => {
    const event = {
      ...baseTestEventValues,
      title: ""
    }
    renderSubmitButton(event)
    expect(button()).not.toBeEnabled()
  })

  it("should be disabled when event has no location", () => {
    const event = {
      ...baseTestEventValues,
      location: undefined
    }
    renderSubmitButton(event)
    expect(button()).not.toBeEnabled()
  })

  it("should be disabled when submitting", async () => {
    submitAction.mockImplementation(neverPromise)
    renderSubmitButton(baseTestEventValues)
    submit()
    await waitFor(() => expect(button()).not.toBeEnabled())
  })

  it("should parse the current event values into an update input on submission", async () => {
    renderSubmitButton(baseTestEventValues)
    submit()
    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledWith({
        title: baseTestEventValues.title,
        description: baseTestEventValues.description,
        location: baseTestEventValues.location!!,
        color: EventColors.Red,
        startDate: baseTestEventValues.startDate,
        endDate: baseTestEventValues.endDate,
        shouldHideAfterStartDate: false,
        radiusMeters: 0
      })
    })
  })

  it("should make the description undefined when empty in submitted update input", async () => {
    renderSubmitButton({ ...baseTestEventValues, description: "" })
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
    submit()
    await waitFor(() => expect(button()).toBeEnabled())
  })
})

const testButtonLabel = "Test Submit"

const renderSubmitButton = (values: EventFormValues) => {
  render(
    <EventForm initialValues={values} onSubmit={submitAction}>
      <EventFormSubmitButton label={testButtonLabel} />
    </EventForm>
  )
}

const submit = () => {
  fireEvent.press(button())
}

const button = () => {
  return screen.getByText(testButtonLabel)
}
