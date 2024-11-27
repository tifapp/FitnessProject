import { RudeusUserStorage } from "./UserStorage"
import { RudeusAPI, TEST_RUDEUS_URL } from "./RudeusAPI"
import { ALERTS, registerUser, useRudeusRegister } from "./Register"
import { InMemorySecureStore } from "@lib/SecureStore"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { captureAlerts } from "@test-helpers/Alerts"
import { mockRudeusServer } from "./TestHelpers"
import { MOCK_USER, MOCK_USER_TOKEN } from "./Models"

describe("RudeusRegister tests", () => {
  describe("UseRudeusRegister tests", () => {
    const tokenStorage = new RudeusUserStorage(new InMemorySecureStore())
    const api = RudeusAPI(tokenStorage, TEST_RUDEUS_URL)
    const onSuccess = jest.fn()

    beforeEach(() => jest.resetAllMocks())

    it("should not allow registration with an empty name", () => {
      const { result } = renderUseRudeusRegister()
      expect(result.current.submission.status).toEqual("invalid")
    })

    test("submission success", async () => {
      const { result } = renderUseRudeusRegister()
      act(() => result.current.nameChanged(MOCK_USER.name))
      const user = { ...MOCK_USER, token: MOCK_USER_TOKEN }
      mockRudeusServer({
        register: {
          expectedRequest: { body: { name: user.name } },
          mockResponse: { status: 201, data: user }
        }
      })
      act(() => (result.current.submission as any).submit())

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(user)
      })
      expect(alertPresentationSpy).not.toHaveBeenCalled()
      const storedUser = await tokenStorage.user()
      expect(storedUser).toEqual(MOCK_USER)
    })

    test("submission failure", async () => {
      const { result } = renderUseRudeusRegister()
      act(() => result.current.nameChanged(MOCK_USER.name))
      mockRudeusServer({ register: { mockResponse: { status: 500 } as any } })
      act(() => (result.current.submission as any).submit())

      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenPresentedWith(
          ALERTS.failedToRegister
        )
      })
      expect(onSuccess).not.toHaveBeenCalled()
    })

    const { alertPresentationSpy } = captureAlerts()

    const renderUseRudeusRegister = () => {
      return renderHook(
        () =>
          useRudeusRegister({
            register: async (name) =>
              await registerUser(name, api, tokenStorage),
            onSuccess
          }),
        {
          wrapper: ({ children }) => (
            <TestQueryClientProvider>{children}</TestQueryClientProvider>
          )
        }
      )
    }
  })
})
