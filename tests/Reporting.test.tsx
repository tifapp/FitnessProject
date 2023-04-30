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
  describe("ReportFormView tests", () => {
    it("submits a report with the correct reason when selected", async () => {
      renderForm()
      selectReason("Harassment")
      await waitFor(() => {
        expect(submitReportWithReason).toHaveBeenCalledWith("harassment")
      })
    })

    it("displays an error alert when submission fails", async () => {
      const { alertPresentationSpy } = captureAlerts()
      submitReportWithReason.mockRejectedValue(new Error())
      renderForm()
      selectReason("Violence")
      await waitFor(() => expect(alertPresentationSpy).toHaveBeenCalled())
    })

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
