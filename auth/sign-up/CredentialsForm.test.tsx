import { renderHook, waitFor } from "@testing-library/react-native"
import { useSignUpCredentialsForm } from "./CredentialsForm"
import { act } from "react-test-renderer"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { captureAlerts } from "@test-helpers/Alerts"
import { fakeTimers } from "@test-helpers/Timers"

describe("SignUpCredentialsForm tests", () => {
  describe("useSignUpCredentialsForm tests", () => {
    fakeTimers()

    it("should not be sumbittable when any field is empty", () => {
      const { result } = renderUseSignUpCredentialsForm()
      expect(result.current.submission).toMatchObject({
        status: "invalid",
        nameReason: "empty",
        emailPhoneReason: "empty",
        passwordReason: "empty"
      })

      act(() => result.current.onFieldUpdated("name", "Bitchell Dickle"))
      expect(result.current.submission).toMatchObject({
        status: "invalid",
        emailPhoneReason: "empty",
        passwordReason: "empty"
      })

      act(() => {
        result.current.onFieldUpdated("emailPhoneNumberText", "1234567890")
      })
      expect(result.current.submission).toMatchObject({
        status: "invalid",
        passwordReason: "empty"
      })

      act(() => {
        result.current.onFieldUpdated("passwordText", "SuperSecretPassword69")
      })
      expect(result.current.submission.status).toEqual("submittable")
    })

    it("should have an invalid email message when invalid email entered", () => {
      const { result } = renderUseSignUpCredentialsForm()

      act(() => result.current.onEmailPhoneTextTypeToggled())
      act(() => {
        result.current.onFieldUpdated(
          "emailPhoneNumberText",
          "not a valid email"
        )
      })

      expect(result.current.submission).toMatchObject({
        status: "invalid",
        nameReason: "empty",
        emailPhoneReason: "invalid-email",
        passwordReason: "empty"
      })
    })

    it("should have an invalid phone number message when invalid email entered", () => {
      const { result } = renderUseSignUpCredentialsForm()

      act(() => result.current.onFieldUpdated("emailPhoneNumberText", "1234"))

      expect(result.current.submission).toMatchObject({
        status: "invalid",
        nameReason: "empty",
        emailPhoneReason: "invalid-phone-number",
        passwordReason: "empty"
      })
    })

    test("successful submission flow", async () => {
      createAccount.mockResolvedValueOnce("success")

      const { result } = renderUseSignUpCredentialsForm()

      act(() => result.current.onFieldUpdated("name", "Bitchell Dickle"))
      act(() => {
        result.current.onFieldUpdated("emailPhoneNumberText", "1234567890")
      })
      act(() => {
        result.current.onFieldUpdated("passwordText", "SuperSecretPassword69")
      })
      act(() => (result.current.submission as any).submit())

      await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    })

    it("should display an alert when submission fails", async () => {
      createAccount.mockRejectedValueOnce(new Error())

      const { result } = renderUseSignUpCredentialsForm()

      act(() => result.current.onFieldUpdated("name", "Bitchell Dickle"))
      act(() => {
        result.current.onFieldUpdated("emailPhoneNumberText", "1234567890")
      })
      act(() => {
        result.current.onFieldUpdated("passwordText", "SuperSecretPassword69")
      })
      act(() => (result.current.submission as any).submit())

      await waitFor(() => expect(alertPresentationSpy).toHaveBeenCalled())
    })

    it("should display an error for passwords under 8 characters", async () => {
      createAccount.mockRejectedValueOnce(new Error())

      const { result } = renderUseSignUpCredentialsForm()

      act(() => result.current.onFieldUpdated("passwordText", "1234567"))
      expect(result.current.submission).toMatchObject({
        status: "invalid",
        nameReason: "empty",
        emailPhoneReason: "empty",
        passwordReason: "too-short"
      })

      await waitFor(() => expect(alertPresentationSpy).toHaveBeenCalled())
    })

    it("should display an error alert when account creation not success", async () => {
      createAccount.mockResolvedValueOnce("email-already-exists")

      const { result } = renderUseSignUpCredentialsForm()

      act(() => result.current.onFieldUpdated("name", "Bitchell Dickle"))
      act(() => {
        result.current.onFieldUpdated("emailPhoneNumberText", "1234567890")
      })
      act(() => {
        result.current.onFieldUpdated("passwordText", "SuperSecretPassword69")
      })
      act(() => (result.current.submission as any).submit())

      await waitFor(() => expect(alertPresentationSpy).toHaveBeenCalled())
    })

    const onSuccess = jest.fn()
    const createAccount = jest.fn()

    const { alertPresentationSpy } = captureAlerts()

    const renderUseSignUpCredentialsForm = () => {
      return renderHook(
        () => useSignUpCredentialsForm({ createAccount, onSuccess }),
        {
          wrapper: ({ children }: any) => (
            <TestQueryClientProvider>{children}</TestQueryClientProvider>
          )
        }
      )
    }
  })
})
