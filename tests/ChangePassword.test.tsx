import { Password } from "@lib/Password"
import {
  changePassword,
  useChangePassword
} from "@screens/changePassword/ChangePasswordScreen"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import { captureAlerts } from "./helpers/Alerts"
import { TestQueryClientProvider } from "./helpers/ReactQuery"

describe("ChangePassword tests", () => {
  describe("UseChangePassword tests", () => {
    const passwordChange = jest.fn()
    const { tapAlertButton, alertPresentationSpy } = captureAlerts()
    const retry = async () => {
      await tapAlertButton("Try Again")
    }
    const renderChangePassword = () => {
      return renderHook(
        () =>
          useChangePassword({
            onSubmitted: changePassword,
            onSuccess: () => console.log("Success")
          }),
        {
          wrapper: ({ children }) => (
            <TestQueryClientProvider>{children}</TestQueryClientProvider>
          )
        }
      )
    }
    it("should give an invalid state, if the current password matches the new password", () => {
      const currentPassword = "FiddleSticks32@"

      const { result } = renderChangePassword()

      act(() => result.current.updateField("currentPassword", currentPassword))
      act(() => result.current.updateField("newPassword", currentPassword))

      expect(result.current.submission).toMatchObject({
        status: "invalid",
        error: "current-matches-new"
      })
    })
    it("should give an invalid state, if the re-entered password does not match the new password", () => {
      const reEnteredPassword = "WaterBottle2%"

      const { result } = renderChangePassword()

      act(() => result.current.updateField("newPassword", reEnteredPassword))
      act(() => result.current.updateField("reEnteredPassword", "K"))

      expect(result.current.submission).toMatchObject({
        status: "invalid",
        error: "reenter-does-not-match-new"
      })
    })
    it("should give an invalid state, if the new password is not strong enough: too short", () => {
      const newPassword = "Wat2%"

      const { result } = renderChangePassword()

      act(() => result.current.updateField("currentPassword", "ReturnToAll32@"))
      act(() => result.current.updateField("newPassword", newPassword))
      act(() => result.current.updateField("reEnteredPassword", newPassword))

      expect(result.current.submission).toMatchObject({
        status: "invalid",
        error: "weak-new-password"
      })
    })
    it("should have a successful submission flow", async () => {
      passwordChange.mockResolvedValue("valid")

      const { result } = renderChangePassword()

      act(() => result.current.updateField("currentPassword", "ReturnToAll32@"))
      act(() => result.current.updateField("newPassword", "OblivionAwaits43#"))
      act(() =>
        result.current.updateField("reEnteredPassword", "OblivionAwaits43#")
      )

      expect(result.current.submission.status).toEqual("valid")

      act(() => result.current.submission.submit?.())
      await waitFor(() => {
        expect(result.current.submission.status).toEqual("submitting")
      })
      expect(passwordChange).toHaveBeenCalledWith(
        "ReturnToAll32@",
        Password.validate("OblivionAwaits43#")
      )
    })
    it("should have a failed submission flow", async () => {
      passwordChange.mockResolvedValue("incorrect-password")

      const { result } = renderChangePassword()

      act(() => result.current.updateField("currentPassword", "ReturnToAll32@"))
      act(() => result.current.updateField("newPassword", "OblivionAwaits43#"))
      act(() =>
        result.current.updateField("reEnteredPassword", "OblivionAwaits43#")
      )

      expect(result.current.submission.status).toEqual("valid")

      act(() => result.current.submission.submit?.())
      await waitFor(() => {
        expect(result.current.submission.status).toEqual("submitting")
      })
      await waitFor(() => {
        expect(result.current.submission.error).toEqual(
          "incorrect-current-password"
        )
        expect(result.current.submission.status).toEqual("invalid")
      })
    })
    it("should be able to retry when it gets an error", async () => {
      passwordChange.mockRejectedValue(new Error())

      const { result } = renderChangePassword()

      act(() => result.current.updateField("currentPassword", "ReturnToAll32@"))
      act(() => result.current.updateField("newPassword", "OblivionAwaits43#"))
      act(() =>
        result.current.updateField("reEnteredPassword", "OblivionAwaits43#")
      )

      expect(result.current.submission.status).toEqual("valid")

      act(() => result.current.submission.submit?.())
      await waitFor(() => {
        expect(result.current.submission.status).toEqual("submitting")
      })
      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenCalled()
      })
      await act(async () => await retry())
      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenCalledTimes(2)
      })
    })
  })
})
