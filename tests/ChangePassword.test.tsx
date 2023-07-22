import { Password } from "@lib/Password"
import { useChangePassword } from "@screens/changePassword/ChangePasswordScreen"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import { TestQueryClientProvider } from "./helpers/ReactQuery"

describe("ChangePassword tests", () => {
  describe("UseChangePassword tests", () => {
    const passwordChange = jest.fn()
    const renderChangePassword = () => {
      return renderHook(
        () => useChangePassword({ onPasswordChangeSubmitted: passwordChange }),
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

      act(() => result.current.setCurrentPassword(currentPassword))
      act(() => result.current.setNewPassword(currentPassword))

      expect(result.current.submission).toMatchObject({
        status: "invalid",
        error: "current-matches-new"
      })
    })
    it("should give an invalid state, if the re-entered password does not match the new password", () => {
      const reEnteredPassword = "WaterBottle2%"

      const { result } = renderChangePassword()

      act(() => result.current.setNewPassword(reEnteredPassword))
      act(() => result.current.setReEnteredPassword("K"))

      expect(result.current.submission).toMatchObject({
        status: "invalid",
        error: "reenter-does-not-match-new"
      })
    })
    it("should give an invalid state, if the new password is not strong enough: too short", () => {
      const newPassword = "Wat2%"

      const { result } = renderChangePassword()

      act(() => result.current.setCurrentPassword("ReturnToAll32@"))
      act(() => result.current.setNewPassword(newPassword))
      act(() => result.current.setReEnteredPassword(newPassword))

      expect(result.current.submission).toMatchObject({
        status: "invalid",
        error: "weak-new-password"
      })
    })
    it("should have a successful submission flow", async () => {
      passwordChange.mockResolvedValue("valid")

      const { result } = renderChangePassword()

      act(() => result.current.setCurrentPassword("ReturnToAll32@"))
      act(() => result.current.setNewPassword("OblivionAwaits43#"))
      act(() => result.current.setReEnteredPassword("OblivionAwaits43#"))

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

      act(() => result.current.setCurrentPassword("ReturnToAll32@"))
      act(() => result.current.setNewPassword("OblivionAwaits43#"))
      act(() => result.current.setReEnteredPassword("OblivionAwaits43#"))

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
  })
})
