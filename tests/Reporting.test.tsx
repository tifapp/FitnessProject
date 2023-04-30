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

describe("Reporting tests", () => {
  beforeEach(() => jest.resetAllMocks())

  describe("ReportFormView tests", () => {
    it("submits a report with the correct reason when selected", async () => {
      renderForm()
      selectReason("Harassment")
      await waitFor(() => {
        expect(submitReportWithReason).toHaveBeenCalledWith("harassment")
      })
    })

    it("displays an error alert when submission fails", async () => {
      submitReportWithReason.mockRejectedValue(new Error())
      renderForm()
      selectReason("Violence")
      await waitFor(() => expect(alertPresentationSpy).toHaveBeenCalled())
    })

    it("allows for retrying submitting a report multiple times when something goes wrong", async () => {
      submitReportWithReason.mockRejectedValue(new Error())
      renderForm()
      selectReason("Spam")
      await waitFor(() => expect(alertPresentationSpy).toHaveBeenCalled())
      await retrySubmission()
      await retrySubmission()
      await waitFor(() => {
        expect(submitReportWithReason).toHaveBeenCalledTimes(3)
      })
    })

    it("disallows selecting other submissions when in process of current submission", async () => {
      submitReportWithReason.mockImplementation(neverPromise)
      renderForm()
      selectReason("Other")
      expect(canSelectAnyReason()).toEqual(false)
    })

    it("reallows submitting when current submission errors", async () => {
      submitReportWithReason.mockRejectedValue(new Error())
      renderForm()
      selectReason("Hate speech")
      await waitFor(() => expect(canSelectAnyReason()).toEqual(true))
    })

    const { alertPresentationSpy, tapAlertButton } = captureAlerts()

    const retrySubmission = async () => {
      await tapAlertButton("Try Again")
    }

    const submitReportWithReason = jest.fn()

    const selectReason = (reason: string) => {
      fireEvent.press(screen.getByText(reason))
    }

    const canSelectAnyReason = () => {
      return REPORTING_REASONS.every((reason) => {
        return !screen.getByTestId(reason).props.accessibilityState.disabled
      })
    }

    const renderForm = () => {
      return render(
        <ReportFormView onSubmitWithReason={submitReportWithReason} />
      )
    }
  })
})
