import {
  changePassword,
  useChangePassword
} from "@screens/changePassword/ChangePasswordScreen"
import { act, renderHook } from "@testing-library/react-native"

describe("ChangePassword tests", () => {
  describe("UseChangePassword tests", () => {
    const renderChangePassword = () => {
      return renderHook(() =>
        useChangePassword({ onPasswordChangeSubmitted: changePassword })
      )
    }
    it("should give an invalid state, if the current password matches the new password", () => {
      const currentPassword = "FiddleSticks32@"

      const { result } = renderChangePassword()

      act(() => result.current.setCurrentPassword(currentPassword))
      act(() => result.current.setNewPassword(currentPassword))

      expect(result.current.validationState).toMatchObject({
        status: "invalid",
        error: "current-matches-new"
      })
    })
    it("should give an invalid state, if the re-entered password does not match the new password", () => {
      const reEnteredPassword = "WaterBottle2%"

      const { result } = renderChangePassword()

      act(() => result.current.setNewPassword(reEnteredPassword))
      act(() => result.current.setReEnteredPassword("K"))

      expect(result.current.validationState).toMatchObject({
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

      expect(result.current.validationState).toMatchObject({
        status: "invalid",
        error: "too-short"
      })
    })
    it("should give an invalid state, if the new password is not strong enough: no-capitals", () => {
      const newPassword = "asct$32f"

      const { result } = renderChangePassword()

      act(() => result.current.setCurrentPassword("ReturnToAll32@"))
      act(() => result.current.setNewPassword(newPassword))
      act(() => result.current.setReEnteredPassword(newPassword))

      expect(result.current.validationState).toMatchObject({
        status: "invalid",
        error: "no-capitals"
      })
    })
    it("should give a valid state, if all conditions are met", () => {
      const { result } = renderChangePassword()

      act(() => result.current.setCurrentPassword("ReturnToAll32@"))
      act(() => result.current.setNewPassword("OblivionAwaits43#"))
      act(() => result.current.setReEnteredPassword("OblivionAwaits43#"))

      expect(result.current.validationState).toHaveProperty("status", "valid")
    })
  })
})
