import { EventFormValues } from "@components/eventForm"
import { dateRange } from "@lib/Date"
import { UpdateDependencyValues } from "@lib/dependencies"
import { EventColors } from "@lib/events/EventColors"
import { geocodingDependencyKey } from "@lib/location"
import EventFormScreen from "@screens/EventFormScreen"
import {
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native"
import { unimplementedGeocoding } from "../../helpers/Geocoding"
import { TestQueryClientProvider } from "../../helpers/ReactQuery"
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
} from "./helpers"
import { hapticsDependencyKey } from "@lib/Haptics"
import { neverPromise } from "../../helpers/Promise"
import { NavigationContainer } from "@react-navigation/native"
import { setPlatform } from "../../helpers/Platform"

const testLocation = { latitude: 45.0, longitude: -121.0 }

describe("EventFormScreen tests", () => {
  beforeEach(() => jest.resetAllMocks())

  it("should be able to edit and submit a form with a preselected location", async () => {
    renderEventFormScreen({
      ...baseTestEventFormValues,
      locationInfo: { coordinates: testLocation }
    })
    moveEventStartDate(new Date(0))
    moveEventEndDate(new Date(1))
    toggleShouldHideAfterStartDate(false)
    editEventTitle(editedTitle)
    editEventDescription("Hello world this is a test!")
    pickEventColor("Blue")
    submit()

    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledWith({
        title: editedTitle,
        description: "Hello world this is a test!",
        dateRange: dateRange(new Date(0), new Date(1)),
        color: EventColors.Blue,
        location: testLocation,
        radiusMeters: 0,
        shouldHideAfterStartDate: false
      })
    })
  })

  it("should present an error alert when a submission error occurs", async () => {
    submitAction.mockRejectedValue(new Error())
    renderEventFormScreen(baseTestEventFormValues)
    editEventDescription("Nice")
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

  it("should allow dismissing the confirmation alert without dismissing the form", async () => {
    renderEventFormScreen(baseTestEventFormValues)
    editEventTitle(editedTitle)
    attemptDismiss()
    await dismissConfirmationAlert()

    expect(dismissAction).not.toHaveBeenCalled()
  })

  it("should be able to dismiss the form from the confirmation alert", async () => {
    renderEventFormScreen(baseTestEventFormValues)
    editEventTitle(editedTitle)
    attemptDismiss()
    await dismissFormFromConfirmationAlert()

    expect(dismissAction).toHaveBeenCalled()
  })

  it("should not be able to submit initial form content", () => {
    renderEventFormScreen(baseTestEventFormValues)
    expect(canSubmit()).toEqual(false)
  })

  it("cannot submit form with an empty title", () => {
    renderEventFormScreen({ ...baseTestEventFormValues, title: "" })
    expect(canSubmit()).toEqual(false)
  })

  it("cannot submit form with no location", () => {
    renderEventFormScreen({
      ...baseTestEventFormValues,
      locationInfo: undefined
    })
    expect(canSubmit()).toEqual(false)
  })

  it("should not allow submissions when in process of submitting current form", async () => {
    submitAction.mockImplementation(neverPromise)
    renderEventFormScreen(baseTestEventFormValues)
    editEventTitle(editedTitle)
    submit()
    await waitFor(() => expect(canSubmit()).toEqual(false))
  })

  it("should make the description undefined when empty in submisssion", async () => {
    renderEventFormScreen({ ...baseTestEventFormValues, description: "" })
    editEventTitle(editedTitle)
    submit()
    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledWith(
        expect.objectContaining({ description: undefined })
      )
    })
  })

  it("should re-enable submissions after current submission finishes", async () => {
    submitAction.mockImplementation(Promise.resolve)
    renderEventFormScreen(baseTestEventFormValues)
    editEventTitle(editedTitle)
    submit()
    await waitFor(() => expect(canSubmit()).toEqual(true))
  })
})

const editedTitle = "Test title"

const { alertPresentationSpy, tapAlertButton } = captureAlerts()

const testSubmissionLabel = "Test Submit"

const submitAction = jest.fn()
const dismissAction = jest.fn()

const renderEventFormScreen = (values: EventFormValues) => {
  render(
    <NavigationContainer>
      <TestQueryClientProvider>
        <UpdateDependencyValues
          update={(values) => {
            const geocoding = unimplementedGeocoding()
            geocoding.reverseGeocode.mockImplementation(neverPromise)
            values.set(geocodingDependencyKey, geocoding)
            values.set(hapticsDependencyKey, jest.fn())
          }}
        >
          <EventFormScreen
            submissionLabel={testSubmissionLabel}
            initialValues={values}
            onSubmit={submitAction}
            onDismiss={dismissAction}
          />
        </UpdateDependencyValues>
      </TestQueryClientProvider>
    </NavigationContainer>
  )
}

const submit = () => {
  fireEvent.press(screen.getByText(testSubmissionLabel))
}

const canSubmit = () => {
  return !screen.getByText(testSubmissionLabel).props.disabled
}

const dismissConfirmationAlert = async () => {
  await tapAlertButton("Keep Editing")
}

const dismissFormFromConfirmationAlert = async () => {
  await tapAlertButton("Discard")
}