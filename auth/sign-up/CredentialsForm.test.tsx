import { renderHook, waitFor } from "@testing-library/react-native"
import { useSignUpCredentialsForm } from "./CredentialsForm"
import { act } from "react-test-renderer"
import { TestQueryClientProvider } from "../../tests/helpers/ReactQuery"
import { captureAlerts } from "../../tests/helpers/Alerts"

describe("SignUpCredentialsForm tests", () => {
  describe("useSignUpCredentialsForm tests", () => {
    it("should not be sumbittable when any field is empty", () => {
      const { result } = renderUseSignUpCredentialsForm()
      expect(result.current.submission).toMatchObject({
        status: "invalid",
        reason: "one-or-more-fields-empty"
      })

      act(() => result.current.onFieldUpdated("name", "Bitchell Dickle"))
      expect(result.current.submission).toMatchObject({
        status: "invalid",
        reason: "one-or-more-fields-empty"
      })

      act(() => {
        result.current.onFieldUpdated("emailPhoneNumberText", "1234567890")
      })
      expect(result.current.submission).toMatchObject({
        status: "invalid",
        reason: "one-or-more-fields-empty"
      })

      act(() => {
        result.current.onFieldUpdated("passwordText", "SuperSecretPassword69")
      })
      expect(result.current.submission.status).toEqual("submittable")
    })

    it("should have an invalid email message when invalid email entered", () => {
      const { result } = renderUseSignUpCredentialsForm()

      act(() => result.current.toggleEmailPhoneTextType())
      act(() => {
        result.current.onFieldUpdated(
          "emailPhoneNumberText",
          "not a valid email"
        )
      })

      expect(result.current.submission).toMatchObject({
        status: "invalid",
        reason: "invalid-email"
      })
    })

    it("should have an invalid phone number message when invalid email entered", () => {
      const { result } = renderUseSignUpCredentialsForm()

      act(() => result.current.onFieldUpdated("emailPhoneNumberText", "1234"))

      expect(result.current.submission).toMatchObject({
        status: "invalid",
        reason: "invalid-phone-number"
      })
    })

    test("successful submission flow", async () => {
      createAccount.mockReturnValueOnce(Promise.resolve())

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

    it("shoulde display an alert when submission fails", async () => {
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
