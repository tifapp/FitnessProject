import {
  EventForm,
  EventFormDismissButton,
  EventFormTitleField,
  EventFormValues
} from "@components/eventForm"
import {
  attemptDismiss,
  baseTestEventFormValues,
  editEventTitle
} from "./helpers"
import { captureAlerts } from "../../helpers/Alerts"
import { render } from "@testing-library/react-native"

describe("EventFormDismissButton tests", () => {
  beforeEach(() => jest.resetAllMocks())

  it("should cleanly dismiss when event has not been edited", () => {
    renderDismissButton(baseTestEventFormValues)
    attemptDismiss()
    expect(dismissAction).toHaveBeenCalled()
    expect(alertPresentationSpy).not.toHaveBeenCalled()
  })

  it("should present a confirmation alert when dismissing after the event has been edited", () => {
    renderDismissButton(baseTestEventFormValues)
    editEventTitle(editedEventTitle)
    attemptDismiss()
    expect(dismissAction).not.toHaveBeenCalled()
    expect(alertPresentationSpy).toHaveBeenCalled()
  })

  it("should allow dismissing the confirmation alert without dismissing the form", async () => {
    renderDismissButton(baseTestEventFormValues)
    editEventTitle(editedEventTitle)
    attemptDismiss()
    await dismissConfirmationAlert()
    expect(dismissAction).not.toHaveBeenCalled()
  })

  it("should be able to dismiss the form from the confirmation alert", async () => {
    renderDismissButton(baseTestEventFormValues)
    editEventTitle(editedEventTitle)
    attemptDismiss()
    await dismissFormFromConfirmationAlert()
    expect(dismissAction).toHaveBeenCalled()
  })
})

const { alertPresentationSpy, tapAlertButton } = captureAlerts()

const editedEventTitle = baseTestEventFormValues.title + " Updated"

const dismissAction = jest.fn()

const renderDismissButton = (values: EventFormValues) => {
  render(
    <EventForm
      initialValues={values}
      onSubmit={jest.fn()}
      onDismiss={dismissAction}
    >
      <EventFormTitleField />
      <EventFormDismissButton />
    </EventForm>
  )
}

const dismissConfirmationAlert = async () => {
  await tapAlertButton("Keep Editing")
}

const dismissFormFromConfirmationAlert = async () => {
  await tapAlertButton("Discard")
}
