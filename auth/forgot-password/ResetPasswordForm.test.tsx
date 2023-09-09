import { useChangePasswordForm } from "@auth/ChangePasswordForm"
import { Password } from "@auth/Password"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import { captureAlerts } from "../../tests/helpers/Alerts"
import { neverPromise } from "../../tests/helpers/Promise"
import {
  TestQueryClientProvider,
  createTestQueryClient
} from "../../tests/helpers/ReactQuery"

describe("ResetPassword tests", () => {
  beforeEach(() => jest.resetAllMocks())

  describe("UseResetPassword tests", () => {
    const queryClient = createTestQueryClient()
    beforeEach(() => queryClient.clear())

    afterAll(() => {
      queryClient.resetQueries()
      queryClient.clear()
    })

    const resetPassword = jest.fn()
    const onSuccess = jest.fn()

    const { tapAlertButton, alertPresentationSpy } = captureAlerts()

    const retry = async () => {
      await tapAlertButton("Try Again")
    }

    const renderResetPassword = () => {
      return renderHook(
        () =>
          useChangePasswordForm({
            onSubmitted: resetPassword,
            onSuccess
          }),
        {
          wrapper: ({ children }) => (
            <TestQueryClientProvider client={queryClient}>
              {children}
            </TestQueryClientProvider>
          )
        }
      )
    }

    it("should give an invalid state, if the re-entered password does not match the new password", () => {
      const reEnteredPassword = "WaterBottle2%"
      const { result } = renderResetPassword()

      act(() => result.current.updateField("newPassword", reEnteredPassword))
      act(() => result.current.updateField("reEnteredPassword", "K"))

      expect(result.current.submission).toMatchObject({
        status: "invalid",
        error: "reenter-does-not-match-new"
      })
    })

    it("should give an invalid state, if the new password is not strong enough: too short", () => {
      const newPassword = "Wat2%"
      const { result } = renderResetPassword()

      act(() => result.current.updateField("newPassword", newPassword))
      act(() => result.current.updateField("reEnteredPassword", newPassword))

      expect(result.current.submission).toMatchObject({
        status: "invalid",
        error: "weak-new-password"
      })
    })

    it("should have a submitting status while in process in submitting", async () => {
      resetPassword.mockImplementation(neverPromise)
      const { result } = renderResetPassword()

      act(() => result.current.updateField("newPassword", "OblivionAwaits43#"))
      act(() => {
        result.current.updateField("reEnteredPassword", "OblivionAwaits43#")
      })

      expect(result.current.submission.status).toEqual("valid")

      act(() => result.current.submission.submit?.())

      await waitFor(() => {
        expect(result.current.submission.status).toEqual("submitting")
      })
    })

    it("should have a successful submission flow", async () => {
      resetPassword.mockImplementation((newPass: Password) => {
        if (newPass.rawValue === "OblivionAwaits43#") {
          return Promise.resolve("valid")
        }
        return Promise.resolve("invalid")
      })

      const { result } = renderResetPassword()

      act(() => result.current.updateField("newPassword", "OblivionAwaits43#"))
      act(() => {
        result.current.updateField("reEnteredPassword", "OblivionAwaits43#")
      })

      expect(result.current.submission.status).toEqual("valid")

      act(() => result.current.submission.submit?.())

      await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    })

    it("should be able to retry when it gets an error", async () => {
      resetPassword
        .mockRejectedValueOnce(new Error())
        .mockResolvedValueOnce("valid")

      const { result } = renderResetPassword()

      act(() => result.current.updateField("newPassword", "OblivionAwaits43#"))
      act(() =>
        result.current.updateField("reEnteredPassword", "OblivionAwaits43#")
      )

      expect(result.current.submission.status).toEqual("valid")

      act(() => result.current.submission.submit?.())

      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenCalled()
      })

      await act(async () => await retry())

      await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    })

    it("should not produce error messages when no input is initially given", () => {
      const { result } = renderResetPassword()

      expect(result.current.submission.status).toEqual("invalid")
      expect(result.current.submission.error).toBeUndefined()
    })
  })
})
