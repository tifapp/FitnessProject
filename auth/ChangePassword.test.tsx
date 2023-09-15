import { Password } from "@auth/Password"
import { useChangePasswordForm } from "@auth/ChangePasswordForm"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import { captureAlerts } from "../tests/helpers/Alerts"
import {
  TestQueryClientProvider,
  createTestQueryClient
} from "../tests/helpers/ReactQuery"
import { neverPromise } from "../tests/helpers/Promise"

describe("ChangePassword tests", () => {
  beforeEach(() => jest.resetAllMocks())

  describe("UseChangePassword tests", () => {
    const queryClient = createTestQueryClient()
    beforeEach(() => queryClient.clear())

    afterAll(() => {
      queryClient.resetQueries()
      queryClient.clear()
    })

    const changePassword = jest.fn()
    const onSuccess = jest.fn()

    const { tapAlertButton, alertPresentationSpy } = captureAlerts()

    const retry = async () => {
      await tapAlertButton("Try Again")
    }

    const renderChangePassword = () => {
      return renderHook(
        () =>
          useChangePasswordForm({
            onSubmitted: changePassword,
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

    it("should have a submitting status while in process in submitting", async () => {
      changePassword.mockImplementation(neverPromise)
      const { result } = renderChangePassword()

      act(() => result.current.updateField("currentPassword", "ReturnToAll32@"))
      act(() => result.current.updateField("newPassword", "OblivionAwaits43#"))
      act(() => {
        result.current.updateField("reEnteredPassword", "OblivionAwaits43#")
      })

      act(() => (result.current.submission as any).submit())

      await waitFor(() => {
        expect(result.current.submission.status).toEqual("submitting")
      })
    })

    it("should have a successful submission flow", async () => {
      changePassword.mockImplementation(
        (uncheckedOldPass: string, newPass: Password) => {
          if (
            uncheckedOldPass === "ReturnToAll32@" &&
            newPass.rawValue === "OblivionAwaits43#"
          ) {
            return Promise.resolve("valid")
          }
          return Promise.resolve("invalid")
        }
      )

      const { result } = renderChangePassword()

      act(() => result.current.updateField("currentPassword", "ReturnToAll32@"))
      act(() => result.current.updateField("newPassword", "OblivionAwaits43#"))
      act(() => {
        result.current.updateField("reEnteredPassword", "OblivionAwaits43#")
      })

      act(() => (result.current.submission as any).submit())

      await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    })

    it("should have a failed submission flow", async () => {
      changePassword.mockResolvedValue("incorrect-password")

      const { result } = renderChangePassword()

      act(() => result.current.updateField("currentPassword", "ReturnToAll32@"))
      act(() => result.current.updateField("newPassword", "OblivionAwaits43#"))
      act(() =>
        result.current.updateField("reEnteredPassword", "OblivionAwaits43#")
      )

      act(() => (result.current.submission as any).submit())

      await waitFor(() => {
        expect(result.current.submission).toMatchObject({
          status: "invalid",
          error: "incorrect-current-password"
        })
      })
    })

    it("should be able to retry when it gets an error", async () => {
      changePassword
        .mockRejectedValueOnce(new Error())
        .mockResolvedValueOnce("valid")

      const { result } = renderChangePassword()

      act(() => result.current.updateField("currentPassword", "ReturnToAll32@"))
      act(() => result.current.updateField("newPassword", "OblivionAwaits43#"))
      act(() =>
        result.current.updateField("reEnteredPassword", "OblivionAwaits43#")
      )

      act(() => (result.current.submission as any).submit())

      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenCalled()
      })

      await act(async () => await retry())

      await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    })

    it("should not produce error messages when no input is initially given", () => {
      const { result } = renderChangePassword()

      expect(result.current.submission).toMatchObject({
        status: "invalid"
      })
    })
  })
})
