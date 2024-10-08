import { captureAlerts } from "@test-helpers/Alerts"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { fakeTimers } from "@test-helpers/Timers"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import {
  FORGOT_PASSWORD_ALERTS,
  useForgotPasswordForm
} from "./ForgotPasswordForm"
import { USPhoneNumber } from "@user/privacy"

describe("ForgotPasswordForm tests", () => {
  beforeEach(() => jest.resetAllMocks())

  fakeTimers()

  describe("Verify Email logic tests", () => {
    const initiateForgotPassword = jest.fn()
    const onSuccess = jest.fn()

    const renderForgotPassword = () => {
      return renderHook(
        () =>
          useForgotPasswordForm({
            initiateForgotPassword,
            onSuccess
          }),
        {
          wrapper: ({ children }) => (
            <TestQueryClientProvider>{children}</TestQueryClientProvider>
          )
        }
      )
    }

    const { alertPresentationSpy } = captureAlerts()

    it("can verify an email and send back an error for invalid emails", async () => {
      const emailAddress = "FiddleSticks32ka"
      const { result } = renderForgotPassword()

      act(() =>
        result.current.forgotPasswordText.onActiveTextTypeChanged("email")
      )
      act(() => result.current.forgotPasswordText.onTextChanged(emailAddress))

      await waitFor(() => {
        expect(result.current.submission).toMatchObject({
          status: "invalid",
          error: "invalid-email"
        })
      })
    })

    it("can verify a phone number and send back an error for invalid phone numbers", async () => {
      const phoneNumber = "833412412"
      const { result } = renderForgotPassword()

      act(() =>
        result.current.forgotPasswordText.onActiveTextTypeChanged("phone")
      )
      act(() => result.current.forgotPasswordText.onTextChanged(phoneNumber))

      await waitFor(() => {
        expect(result.current.submission).toMatchObject({
          status: "invalid",
          error: "invalid-phone-number"
        })
      })
    })

    it("can correctly use its logic to proceed onto the next screen after a successful verification", async () => {
      initiateForgotPassword.mockResolvedValueOnce("success")
      const emailAddress = "FiddleSticks32@kale.org"
      const { result } = renderForgotPassword()

      act(() =>
        result.current.forgotPasswordText.onActiveTextTypeChanged("email")
      )
      act(() => result.current.forgotPasswordText.onTextChanged(emailAddress))

      expect(result.current.submission.status).toEqual("submittable")

      act(() => (result.current.submission as any).submit())

      await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    })

    it("can properly display an alert on an error", async () => {
      initiateForgotPassword.mockRejectedValue(new Error())
      const emailAddress = "FiddleSticks32@kale.org"
      const { result } = renderForgotPassword()

      act(() =>
        result.current.forgotPasswordText.onActiveTextTypeChanged("email")
      )
      act(() => result.current.forgotPasswordText.onTextChanged(emailAddress))

      expect(result.current.submission.status).toEqual("submittable")

      act(() => (result.current.submission as any).submit())

      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenCalled()
      })
    })

    test("submit invalid email, displays invalid email alert", async () => {
      initiateForgotPassword.mockResolvedValueOnce("invalid-email")
      const emailAddress = "FiddleSticks32@kale.org"
      const { result } = renderForgotPassword()

      act(() =>
        result.current.forgotPasswordText.onActiveTextTypeChanged("email")
      )
      act(() => result.current.forgotPasswordText.onTextChanged(emailAddress))

      act(() => (result.current.submission as any).submit())

      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenPresentedWith(
          FORGOT_PASSWORD_ALERTS["invalid-email"]
        )
      })
      expect(onSuccess).not.toHaveBeenCalled()
    })

    test("submit invalid phone number, displays invalid email alert", async () => {
      initiateForgotPassword.mockResolvedValueOnce("invalid-phone-number")
      const { result } = renderForgotPassword()

      act(() =>
        result.current.forgotPasswordText.onTextChanged(
          USPhoneNumber.mock.toString()
        )
      )

      act(() => (result.current.submission as any).submit())

      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenPresentedWith(
          FORGOT_PASSWORD_ALERTS["invalid-phone-number"]
        )
      })
      expect(onSuccess).not.toHaveBeenCalled()
    })
  })
})
