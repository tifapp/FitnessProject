import { ReportFormView } from "./Form"
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native"
import React from "react"
import { captureAlerts } from "@test-helpers/Alerts"
import { neverPromise } from "@test-helpers/Promise"
import { REPORTING_REASONS } from "./Models"
import "@test-helpers/Matchers"
import { fakeTimers } from "@test-helpers/Timers"

describe("Reporting tests", () => {
  beforeEach(() => jest.resetAllMocks())

  describe("ReportingUI tests", () => {
    describe("ReportFormView tests", () => {
      fakeTimers()

      it("submits a report with the correct reason when selected", async () => {
        renderForm()
        submitReportReason("Harassment")
        await waitFor(() => {
          expect(submitReportAction).toHaveBeenCalledWith("harassment")
        })
      })

      it("displays an error alert when submission fails", async () => {
        submitReportAction.mockRejectedValue(new Error())
        renderForm()
        submitReportReason("Violence")
        await waitFor(() => expect(alertPresentationSpy).toHaveBeenCalled())
      })

      it("allows for retrying submitting a report multiple times when something goes wrong", async () => {
        submitReportAction.mockRejectedValue(new Error())
        renderForm()
        submitReportReason("Spam")
        await waitFor(() => expect(alertPresentationSpy).toHaveBeenCalled())
        await retrySubmission()
        await retrySubmission()
        await waitFor(() => {
          expect(submitReportAction).toHaveBeenCalledTimes(3)
        })
      })

      it("disallows submitting other reasons when in process of current submission", async () => {
        submitReportAction.mockImplementation(neverPromise)
        renderForm()
        submitReportReason("Other")
        await waitFor(() => expect(canSubmitAnyReportReason()).toEqual(false))
      })

      it("disallows submitting when current submission success", async () => {
        const waitForSubmission = new Promise<void>((resolve) => {
          submitReportAction.mockImplementation(() => {
            resolve()
            return Promise.resolve()
          })
        })
        renderForm()
        submitReportReason("Violence")

        // NB: Wait for the submission to finish before checking this. This prevents a bug
        // where the user can somehow tap another selection when doing a navigation animation.
        await act(async () => await waitForSubmission)
        expect(canSubmitAnyReportReason()).toEqual(false)
      })

      it("reallows submitting when current submission errors", async () => {
        const waitForSubmission = new Promise<void>((resolve) => {
          submitReportAction.mockImplementation(() => {
            resolve()
            return Promise.reject(new Error())
          })
        })
        renderForm()
        submitReportReason("Hate speech")

        // NB: Make it so that the user explicitly has to dismiss the error alert before re-allowing
        // submissions. This ensures that they cannot somehow submit 2 reasons at once.
        await act(async () => await waitForSubmission)
        expect(canSubmitAnyReportReason()).toEqual(false)

        await dismissErrorAlert()
        await waitFor(() => expect(canSubmitAnyReportReason()).toEqual(true))
      })

      const { alertPresentationSpy, tapAlertButton } = captureAlerts()

      const retrySubmission = async () => {
        await tapAlertButton("Try Again")
      }

      const dismissErrorAlert = async () => {
        await tapAlertButton("Ok")
      }

      const submitReportAction = jest.fn()

      const submitReportReason = (reason: string) => {
        fireEvent.press(screen.getByText(reason))
      }

      const canSubmitAnyReportReason = () => {
        return REPORTING_REASONS.every((reason) => {
          return !screen.getByTestId(reason).props.accessibilityState.disabled
        })
      }

      const renderForm = () => {
        return render(
          <ReportFormView
            contentType="event"
            onSubmitted={submitReportAction}
          />
        )
      }
    })
  })
})
