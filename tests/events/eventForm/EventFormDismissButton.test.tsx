import {
  EventForm,
  EventFormDismissButton,
  EventFormTitleField,
  EventFormValues
} from "@components/eventForm"
import { baseTestEventValues, editEventFormTitle } from "./helpers"
import { captureAlerts } from "../../helpers/Alerts"
import { fireEvent, render, screen } from "@testing-library/react-native"

describe("EventFormDismissButton tests", () => {
  beforeEach(() => jest.resetAllMocks())

  it("should cleanly dismiss when event has not been edited", () => {
    renderDismissButton(baseTestEventValues)
    attemptDismiss()
    expect(dismissAction).toHaveBeenCalled()
    expect(alertPresentationSpy).not.toHaveBeenCalled()
  })

  it("should present a confirmation alert when dismissing after the event has been edited", () => {
    renderDismissButton(baseTestEventValues)
    editEventFormTitle(editedEventTitle)
    attemptDismiss()
    expect(dismissAction).not.toHaveBeenCalled()
    expect(alertPresentationSpy).toHaveBeenCalled()
  })

  it("should allow dismissing the confirmation alert without dismissing the form", async () => {
    renderDismissButton(baseTestEventValues)
    editEventFormTitle(editedEventTitle)
    attemptDismiss()
    await dismissConfirmationAlert()
    expect(dismissAction).not.toHaveBeenCalled()
  })

  it("should be able to dismiss the form from the confirmation alert", async () => {
    renderDismissButton(baseTestEventValues)
    editEventFormTitle(editedEventTitle)
    attemptDismiss()
    await dismissFormFromConfirmationAlert()
    expect(dismissAction).toHaveBeenCalled()
  })
})

const { alertPresentationSpy, tapAlertButton } = captureAlerts()

const editedEventTitle = baseTestEventValues.title + " Updated"

const dismissAction = jest.fn()

const renderDismissButton = (values: EventFormValues) => {
  render(
    <EventForm initialValues={values} onSubmit={jest.fn()}>
      <EventFormTitleField />
      <EventFormDismissButton onDismiss={dismissAction} />
    </EventForm>
  )
}

const dismissConfirmationAlert = async () => {
  await tapAlertButton("Keep Editing")
}

const dismissFormFromConfirmationAlert = async () => {
  await tapAlertButton("Discard")
}

const attemptDismiss = () => {
  fireEvent.press(screen.getByLabelText("Cancel"))
}
