import { ReportFormView } from "@screens/Reporting"
import {
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native"
import React from "react"

describe("Reporting tests", () => {
  describe("ReportFormView tests", () => {
    it("submits a report with the correct reason when selected", async () => {
      renderForm()
      selectReason("Harassment")
      await waitFor(() => {
        expect(submitReportWithReason).toHaveBeenCalledWith("harassment")
      })
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
