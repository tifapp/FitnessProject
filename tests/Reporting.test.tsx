import { ReportFormView } from "@screens/Reporting"
import {
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native"
import React from "react"
import { captureAlerts } from "./helpers/Alerts"

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

    const { alertPresentationSpy, tapAlertButton } = captureAlerts()

    const retrySubmission = async () => {
      await tapAlertButton("Try Again")
    }

    const submitReportWithReason = jest.fn()

    const selectReason = (reason: string) => {
      fireEvent.press(screen.getByText(reason))
    }

    const renderForm = () => {
      return render(
        <ReportFormView onSubmitWithReason={submitReportWithReason} />
      )
    }
  })
})
