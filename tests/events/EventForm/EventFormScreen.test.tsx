import { EventFormValues } from "@components/eventForm"
import { GeocodingFunctionsProvider } from "@hooks/Geocoding"
import { HapticsProvider } from "@lib/Haptics"
import { dateRange } from "@lib/date"
import { EventColors } from "@lib/events"
import { NavigationContainer } from "@react-navigation/native"
import EventFormScreen from "@screens/EventFormScreen"
import {
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native"
import { QueryClient } from "react-query"
import { captureAlerts } from "../../helpers/Alerts"
import { TestHaptics } from "../../helpers/Haptics"
import { neverPromise } from "../../helpers/Promise"
import {
  TestQueryClientProvider,
  cleanupTestQueryClient,
  createTestQueryClient
} from "../../helpers/ReactQuery"
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

const testLocation = { latitude: 45.0, longitude: -121.0 }

const queryClient = createTestQueryClient()

describe("EventFormScreen tests", () => {
  beforeEach(() => jest.resetAllMocks())

  it("should be able to edit and submit a form with a preselected location", async () => {
    renderEventFormScreen(queryClient, {
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
        coordinates: testLocation,
        radiusMeters: 0,
        shouldHideAfterStartDate: false
      })
    })
  })

  it("should present an error alert when a submission error occurs", async () => {
    submitAction.mockRejectedValue(new Error())
    renderEventFormScreen(queryClient, baseTestEventFormValues)
    editEventDescription("Nice")
    submit()

    await waitFor(() => expect(alertPresentationSpy).toHaveBeenCalled())
  })

  it("should be able to be dismissed", () => {
    renderEventFormScreen(queryClient, baseTestEventFormValues)
    attemptDismiss()
    expect(dismissAction).toHaveBeenCalled()
  })

  it("gives a confirmation alert when attempting to dismiss after making edits to the form", () => {
    renderEventFormScreen(queryClient, baseTestEventFormValues)
    toggleShouldHideAfterStartDate(true)
    editEventDescription("Hello world this is a test!")
    pickEventColor("Green")
    attemptDismiss()

    expect(dismissAction).not.toHaveBeenCalled()
    expect(alertPresentationSpy).toHaveBeenCalled()
  })

  it("should allow dismissing the confirmation alert without dismissing the form", async () => {
    renderEventFormScreen(queryClient, baseTestEventFormValues)
    editEventTitle(editedTitle)
    attemptDismiss()
    await dismissConfirmationAlert()

    expect(dismissAction).not.toHaveBeenCalled()
  })

  it("should be able to dismiss the form from the confirmation alert", async () => {
    renderEventFormScreen(queryClient, baseTestEventFormValues)
    editEventTitle(editedTitle)
    attemptDismiss()
    await dismissFormFromConfirmationAlert()

    expect(dismissAction).toHaveBeenCalled()
  })

  it("should not be able to submit initial form content", () => {
    renderEventFormScreen(queryClient, baseTestEventFormValues)
    expect(canSubmit()).toEqual(false)
  })

  it("cannot submit form with an empty title", () => {
    renderEventFormScreen(queryClient, {
      ...baseTestEventFormValues,
      title: ""
    })
    expect(canSubmit()).toEqual(false)
  })

  it("cannot submit form with no location", () => {
    renderEventFormScreen(queryClient, {
      ...baseTestEventFormValues,
      locationInfo: undefined
    })
    expect(canSubmit()).toEqual(false)
  })

  it("should not allow submissions when in process of submitting current form", async () => {
    submitAction.mockImplementation(neverPromise)
    renderEventFormScreen(queryClient, baseTestEventFormValues)
    editEventTitle(editedTitle)
    submit()
    await waitFor(() => expect(canSubmit()).toEqual(false))
  })

  it("should make the description undefined when empty in submisssion", async () => {
    renderEventFormScreen(queryClient, {
      ...baseTestEventFormValues,
      description: ""
    })
    editEventTitle(editedTitle)
    submit()
    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledWith(
        expect.objectContaining({ description: undefined })
      )
    })
  })

  /* it("should re-enable submissions after current submission finishes", async () => {
    submitAction.mockImplementation(Promise.resolve)
    renderEventFormScreen(queryClient, baseTestEventFormValues)
    editEventTitle(editedTitle)
    submit()
    await waitFor(() => expect(canSubmit()).toEqual(true))
  }) */

  afterAll(() => cleanupTestQueryClient(queryClient))
})

const editedTitle = "Test title"

const { alertPresentationSpy, tapAlertButton } = captureAlerts()

const testSubmissionLabel = "Test Submit"

const submitAction = jest.fn()
const dismissAction = jest.fn()

const renderEventFormScreen = (
  queryClient: QueryClient,
  values: EventFormValues
) => {
  render(
    <NavigationContainer>
      <TestQueryClientProvider client={queryClient}>
        <HapticsProvider
          isSupportedOnDevice={false}
          haptics={new TestHaptics()}
        >
          <GeocodingFunctionsProvider reverseGeocode={neverPromise}>
            <EventFormScreen
              submissionLabel={testSubmissionLabel}
              initialValues={values}
              onSubmit={submitAction}
              onDismiss={dismissAction}
            />
          </GeocodingFunctionsProvider>
        </HapticsProvider>
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
