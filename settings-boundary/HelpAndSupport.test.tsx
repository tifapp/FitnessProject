import { captureAlerts } from "@test-helpers/Alerts"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import {
  HELP_AND_SUPPORT_ALERTS,
  HELP_AND_SUPPORT_EMAILS,
  HELP_AND_SUPPORT_EMAIL_ERROR_ALERTS,
  HELP_AND_SUPPORT_EMAIL_SUCCESS_ALERTS,
  useHelpAndSupportSettings
} from "./HelpAndSupport"

describe("HelpAndSupportSettings tests", () => {
  describe("UseHelpAndSupportSettings tests", () => {
    const TEST_COMPILE_LOGS_URI = "test/logs.zip"
    const { alertPresentationSpy, tapAlertButton } = captureAlerts()
    const isShowingContactSection = jest.fn()
    const compileLogs = jest.fn()
    const composeEmail = jest.fn()
    beforeEach(() => {
      jest.resetAllMocks()
    })

    test("Detect if signed in to email", async () => {
      isShowingContactSection.mockResolvedValue(false)
      const { result } = renderUseHelpAndSupportSettings()
      expect(result.current.isShowingContactSection).toEqual(true)
      await waitFor(() =>
        expect(result.current.isShowingContactSection).toEqual(false)
      )
    })

    test("Successful submit feedback flow", async () => {
      const result = await renderSuccessfulEmailCompositionFlow()
      act(() => result.current.feedbackSubmitted())
      await waitFor(async () =>
        expect(alertPresentationSpy).toHaveBeenCalledWith(
          HELP_AND_SUPPORT_EMAIL_SUCCESS_ALERTS.submitFeedbackSuccess.title,
          HELP_AND_SUPPORT_EMAIL_SUCCESS_ALERTS.submitFeedbackSuccess
            .description
        )
      )
      expect(composeEmail).toHaveBeenCalledWith(
        HELP_AND_SUPPORT_EMAILS.feedbackSubmitted
      )
    })

    test("Unsuccessful submit feedback flow", async () => {
      const result = await renderUnsuccessfulEmailCompositionFlow()
      act(() => result.current.feedbackSubmitted())
      await waitFor(async () =>
        expect(alertPresentationSpy).toHaveBeenCalledWith(
          HELP_AND_SUPPORT_EMAIL_ERROR_ALERTS.submitFeedbackError.title,
          HELP_AND_SUPPORT_EMAIL_ERROR_ALERTS.submitFeedbackError.description
        )
      )
    })

    test("Successful report bug flow: no logs selected", async () => {
      compileLogs.mockRejectedValueOnce(new Error("Logs not compiled"))
      const result = await renderSuccessfulEmailCompositionFlow()
      act(() => result.current.bugReported())
      await reportWithoutLogs()
      await waitFor(async () =>
        expect(alertPresentationSpy).toHaveBeenCalledWith(
          HELP_AND_SUPPORT_EMAIL_SUCCESS_ALERTS.reportBugSuccess.title,
          HELP_AND_SUPPORT_EMAIL_SUCCESS_ALERTS.reportBugSuccess.description
        )
      )
      expect(composeEmail).toHaveBeenCalledWith(
        HELP_AND_SUPPORT_EMAILS.bugReported(undefined)
      )
    })

    test("Successful report bug flow: logs success", async () => {
      compileLogs.mockResolvedValueOnce(TEST_COMPILE_LOGS_URI)
      const result = await renderSuccessfulEmailCompositionFlow()
      act(() => result.current.bugReported())
      await reportWithLogs()
      await waitFor(async () =>
        expect(alertPresentationSpy).toHaveBeenCalledWith(
          HELP_AND_SUPPORT_EMAIL_SUCCESS_ALERTS.reportBugSuccess.title,
          HELP_AND_SUPPORT_EMAIL_SUCCESS_ALERTS.reportBugSuccess.description
        )
      )
      expect(composeEmail).toHaveBeenCalledWith(
        HELP_AND_SUPPORT_EMAILS.bugReported(TEST_COMPILE_LOGS_URI)
      )
    })

    test("Successful report bug flow: logs failure, switch to no logs", async () => {
      compileLogs.mockRejectedValueOnce(new Error("Something went wrong"))
      const result = await renderSuccessfulEmailCompositionFlow()
      act(() => result.current.bugReported())
      await reportWithLogs()
      await waitFor(async () =>
        expect(alertPresentationSpy).toHaveBeenCalledWith(
          HELP_AND_SUPPORT_ALERTS.compileLogError.title,
          HELP_AND_SUPPORT_ALERTS.compileLogError.description,
          expect.any(Array)
        )
      )
      await reportWithoutLogsAfterFailure()
      await waitFor(async () =>
        expect(alertPresentationSpy).toHaveBeenCalledWith(
          HELP_AND_SUPPORT_EMAIL_SUCCESS_ALERTS.reportBugSuccess.title,
          HELP_AND_SUPPORT_EMAIL_SUCCESS_ALERTS.reportBugSuccess.description
        )
      )
      expect(composeEmail).toHaveBeenCalledWith(
        HELP_AND_SUPPORT_EMAILS.bugReported(undefined)
      )
    })

    test("Successful submit question flow", async () => {
      const result = await renderSuccessfulEmailCompositionFlow()
      act(() => result.current.questionSubmitted())
      await waitFor(async () =>
        expect(alertPresentationSpy).toHaveBeenCalledWith(
          HELP_AND_SUPPORT_EMAIL_SUCCESS_ALERTS.submitQuestionSuccess.title,
          HELP_AND_SUPPORT_EMAIL_SUCCESS_ALERTS.submitQuestionSuccess
            .description
        )
      )

      expect(composeEmail).toHaveBeenCalledWith(
        HELP_AND_SUPPORT_EMAILS.questionSubmitted
      )
    })

    test("Unsuccessful submit question flow", async () => {
      composeEmail.mockRejectedValue(new Error("Bad error"))
      const { result } = renderUseHelpAndSupportSettings()
      await waitFor(() =>
        expect(result.current.isShowingContactSection).toEqual(true)
      )
      act(() => result.current.questionSubmitted())
      await waitFor(async () =>
        expect(alertPresentationSpy).toHaveBeenCalledWith(
          HELP_AND_SUPPORT_EMAIL_ERROR_ALERTS.submitQuestionError.title,
          HELP_AND_SUPPORT_EMAIL_ERROR_ALERTS.submitQuestionError.description
        )
      )
    })

    const renderSuccessfulEmailCompositionFlow = async () => {
      composeEmail.mockResolvedValue("success")
      const { result } = renderUseHelpAndSupportSettings()
      await waitFor(() =>
        expect(result.current.isShowingContactSection).toEqual(true)
      )
      return result
    }

    const renderUnsuccessfulEmailCompositionFlow = async () => {
      composeEmail.mockRejectedValue(new Error("Bad error"))
      const { result } = renderUseHelpAndSupportSettings()
      await waitFor(() =>
        expect(result.current.isShowingContactSection).toEqual(true)
      )
      return result
    }

    const renderUseHelpAndSupportSettings = () => {
      return renderHook(
        () =>
          useHelpAndSupportSettings({
            isShowingContactSection,
            compileLogs,
            composeEmail
          }),
        {
          wrapper: ({ children }: any) => (
            <TestQueryClientProvider>{children}</TestQueryClientProvider>
          )
        }
      )
    }

    const reportWithoutLogs = async () => {
      await tapAlertButton("No")
    }

    const reportWithoutLogsAfterFailure = async () => {
      await tapAlertButton("OK")
    }

    const reportWithLogs = async () => {
      await tapAlertButton("Yes")
    }
  })
})