import { captureAlerts } from "@test-helpers/Alerts"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import { ALERTS, useAccountInfoSettings } from "./AccountInfo"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { neverPromise } from "@test-helpers/Promise"

describe("AccountInfoSettings tests", () => {
  describe("UseAccountInfoSettings tests", () => {
    const signOut = jest.fn()
    const onSignOutSuccess = jest.fn()

    beforeEach(() => jest.resetAllMocks())

    it("should be able to sign-out with a confirmation alert", async () => {
      const { result } = renderUseAccountInfoSettings()

      act(() => result.current.signOutStarted?.())
      await confirmSignOut()
      await waitFor(() => expect(signOut).toHaveBeenCalled())
      await waitFor(() => expect(onSignOutSuccess).toHaveBeenCalled())
      expect(signOut).toHaveBeenCalledTimes(1)
      expect(onSignOutSuccess).toHaveBeenCalledTimes(1)
    })

    it("should prevent any action from taking place when sign out is in progress", async () => {
      signOut.mockImplementationOnce(neverPromise)

      const { result } = renderUseAccountInfoSettings()

      act(() => result.current.signOutStarted?.())
      expect(result.current.shouldDisableActions).toEqual(false)
      await confirmSignOut()
      await waitFor(() => expect(result.current.signOutStarted).toBeUndefined())
      expect(result.current.shouldDisableActions).toEqual(true)
    })

    it("should present an error alert when the sign out fails", async () => {
      signOut.mockRejectedValueOnce(new Error())

      const { result } = renderUseAccountInfoSettings()

      act(() => result.current.signOutStarted?.())
      await confirmSignOut()
      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenCalledWith(
          ALERTS.signOutError.title,
          ALERTS.signOutError.description,
          undefined
        )
      })
    })

    const renderUseAccountInfoSettings = () => {
      return renderHook(
        () => useAccountInfoSettings({ signOut, onSignOutSuccess }),
        {
          wrapper: ({ children }: any) => (
            <TestQueryClientProvider>{children}</TestQueryClientProvider>
          )
        }
      )
    }

    const { alertPresentationSpy, tapAlertButton } = captureAlerts()

    const confirmSignOut = async () => {
      await tapAlertButton(
        ALERTS.signOutConfirmation.buttons(jest.fn())[1].text
      )
    }
  })
})
