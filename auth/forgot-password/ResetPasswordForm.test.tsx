import { Password } from ".."
import { act, renderHook, waitFor } from "@testing-library/react-native"
import { captureAlerts } from "@test-helpers/Alerts"
import { neverPromise } from "@test-helpers/Promise"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { useResetPasswordForm } from "./ResetPasswordForm"

describe("ResetPassword tests", () => {
  beforeEach(() => jest.resetAllMocks())

  describe("UseResetPassword tests", () => {
    const initiateResetPassword = jest.fn()
    const onSuccess = jest.fn()

    const { alertPresentationSpy } = captureAlerts()

    const renderResetPassword = () => {
      return renderHook(
        () =>
          useResetPasswordForm(undefined, {
            submitResettedPassword: initiateResetPassword,
            onSuccess
          }),
        {
          wrapper: ({ children }) => (
            <TestQueryClientProvider>{children}</TestQueryClientProvider>
          )
        }
      )
    }

    it("should give an invalid state, if the new password is not strong enough: too short", () => {
      const newPassword = "Wat2%"
      const { result } = renderResetPassword()

      act(() => result.current.onTextChanged(newPassword))

      expect(result.current.submission).toMatchObject({
        status: "invalid",
        newPasswordError: "weak-new-password"
      })
    })

    it("should have a submitting status while in process in submitting", async () => {
      initiateResetPassword.mockImplementation(neverPromise)
      const { result } = renderResetPassword()

      act(() => result.current.onTextChanged("OblivionAwaits43#"))

      expect(result.current.submission.status).toEqual("submittable")

      act(() => (result.current.submission as any).submit())

      await waitFor(() => {
        expect(result.current.submission.status).toEqual("submitting")
      })
    })

    it("should have a successful submission flow", async () => {
      initiateResetPassword.mockImplementation((newPass: Password) => {
        if (newPass.rawValue === "OblivionAwaits43#") {
          return Promise.resolve("valid")
        }
        return Promise.resolve("invalid")
      })

      const { result } = renderResetPassword()

      act(() => result.current.onTextChanged("OblivionAwaits43#"))

      expect(result.current.submission.status).toEqual("submittable")

      act(() => (result.current.submission as any).submit())

      await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    })

    it("can properly display an alert on an error", async () => {
      initiateResetPassword.mockRejectedValue(new Error())

      const { result } = renderResetPassword()

      act(() => result.current.onTextChanged("OblivionAwaits43#"))

      expect(result.current.submission.status).toEqual("submittable")

      act(() => (result.current.submission as any).submit())

      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenCalled()
      })
    })

    it("should produce empty error messages when the field is empty", () => {
      const { result } = renderResetPassword()

      expect(result.current.submission).toMatchObject({
        status: "invalid",
        newPasswordError: "empty"
      })
    })
  })
})
