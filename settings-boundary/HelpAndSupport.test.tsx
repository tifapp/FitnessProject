import { captureAlerts } from "@test-helpers/Alerts"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import {
  HELP_AND_SUPPORT_ALERTS,
  HELP_AND_SUPPORT_EMAILS,
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
    test("Successful request feature flow", async () => {
      composeEmail.mockResolvedValue("success")
      const { result } = renderUseHelpAndSupportSettings()
      await waitFor(() =>
        expect(result.current.isShowingContactSection).toEqual(true)
      )
      await act(async () => await result.current.featureRequested())
      expect(alertPresentationSpy).toHaveBeenCalledWith(
        HELP_AND_SUPPORT_ALERTS.requestFeatureSuccess.title,
        HELP_AND_SUPPORT_ALERTS.requestFeatureSuccess.description
      )

      expect(composeEmail).toHaveBeenCalledWith(
        HELP_AND_SUPPORT_EMAILS.featureRequested
      )
    })
    test("Unsuccessful request feature flow", async () => {
      composeEmail.mockRejectedValue(new Error("Bad error"))
      const { result } = renderUseHelpAndSupportSettings()
      await waitFor(() =>
        expect(result.current.isShowingContactSection).toEqual(true)
      )
      await act(async () => await result.current.featureRequested())
      expect(alertPresentationSpy).toHaveBeenCalledWith(
        HELP_AND_SUPPORT_ALERTS.requestFeatureError.title,
        HELP_AND_SUPPORT_ALERTS.requestFeatureError.description
      )
    })
    test("Successful report bug flow: no logs selected", async () => {
      composeEmail.mockResolvedValueOnce("success")
      compileLogs.mockRejectedValueOnce(new Error("Logs not compiled"))
      const { result } = renderUseHelpAndSupportSettings()
      await waitFor(() =>
        expect(result.current.isShowingContactSection).toEqual(true)
      )
      await act(async () => await result.current.bugReported())
      await reportWithoutLogs()
      expect(alertPresentationSpy).toHaveBeenCalledWith(
        HELP_AND_SUPPORT_ALERTS.reportBugSuccess.title,
        HELP_AND_SUPPORT_ALERTS.reportBugSuccess.description
      )
      expect(composeEmail).toHaveBeenCalledWith(
        HELP_AND_SUPPORT_EMAILS.bugReported(undefined)
      )
    })
    test("Successful report bug flow: logs selected", async () => {
      composeEmail.mockResolvedValueOnce("success")
      compileLogs.mockResolvedValueOnce(TEST_COMPILE_LOGS_URI)
      const { result } = renderUseHelpAndSupportSettings()
      await waitFor(() =>
        expect(result.current.isShowingContactSection).toEqual(true)
      )
      await act(async () => await result.current.bugReported())
      await reportWithLogs()
      expect(alertPresentationSpy).toHaveBeenCalledWith(
        HELP_AND_SUPPORT_ALERTS.reportBugSuccess.title,
        HELP_AND_SUPPORT_ALERTS.reportBugSuccess.description
      )
      expect(composeEmail).toHaveBeenCalledWith(
        HELP_AND_SUPPORT_EMAILS.bugReported(TEST_COMPILE_LOGS_URI)
      )
    })
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

    const reportWithLogs = async () => {
      await tapAlertButton("Yes")
    }

    const logsQuestion = async () => {
      await tapAlertButton("What is this?")
    }
  })
})
