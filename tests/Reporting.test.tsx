import { ReportFormView } from "@screens/Reporting"
import {
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native"
import React from "react"
import { captureAlerts } from "./helpers/Alerts"
import { neverPromise } from "./helpers/Promise"
import { REPORTING_REASONS } from "@lib/Reporting"
import "./helpers/Matchers"

describe("Reporting tests", () => {
  beforeEach(() => jest.resetAllMocks())

  describe("ReportingUI tests", () => {
    describe("ReportFormView tests", () => {
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
        expect(canSubmitAnyReportReason()).toEqual(false)
      })

      it("reallows submitting when current submission errors", async () => {
        submitReportAction.mockRejectedValue(new Error())
        renderForm()
        submitReportReason("Hate speech")
        await waitFor(() => expect(canSubmitAnyReportReason()).toEqual(true))
      })

      const { alertPresentationSpy, tapAlertButton } = captureAlerts()

      const retrySubmission = async () => {
        await tapAlertButton("Try Again")
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
