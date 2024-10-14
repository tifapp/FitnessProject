import { renderHook, waitFor } from "@testing-library/react-native"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { SIGN_IN_ALERTS, useSignInForm } from "./SignInForm"
import { act } from "react-test-renderer"
import { captureAlerts } from "@test-helpers/Alerts"
import { USPhoneNumber } from "@user/privacy"

describe("SignInForm tests", () => {
  beforeEach(() => jest.resetAllMocks())

  describe("UseSignInForm tests", () => {
    test("invalid form states", () => {
      const { result } = renderUseSignInForm()
      expect(result.current.submission).toMatchObject({
        status: "invalid",
        emailPhoneReason: "empty",
        passwordReason: "empty"
      })

      act(() => result.current.onPasswordChanged("1234"))

      expect(result.current.submission).toMatchObject({
        status: "invalid",
        emailPhoneReason: "empty",
        passwordReason: undefined
      })

      act(() => result.current.onEmailPhoneTextChanged("1111"))
      expect(result.current.submission).toMatchObject({
        status: "invalid",
        emailPhoneReason: "invalid-phone-number",
        passwordReason: undefined
      })

      act(() => result.current.onEmailPhoneTextTypeToggled())
      act(() => result.current.onEmailPhoneTextChanged("kids"))
      expect(result.current.submission).toMatchObject({
        status: "invalid",
        emailPhoneReason: "invalid-email",
        passwordReason: undefined
      })
    })

    test("successful submission flow", async () => {
      signIn.mockResolvedValueOnce("success")

      const { result } = renderUseSignInForm()
      act(() => result.current.onPasswordChanged("1234"))
      act(() => result.current.onEmailPhoneTextChanged("(111) 111-1111"))
      act(() => (result.current.submission as any).submit())

      await waitFor(() =>
        expect(onSuccess).toHaveBeenCalledWith(
          "success",
          USPhoneNumber.parse("(111) 111-1111")
        )
      )
    })

    test("incorrect credentials submission flow, displays alert", async () => {
      signIn.mockResolvedValueOnce("incorrect-credentials")

      const { result } = renderUseSignInForm()
      act(() => result.current.onPasswordChanged("1234"))
      act(() => result.current.onEmailPhoneTextChanged("(111) 111-1111"))
      act(() => (result.current.submission as any).submit())

      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenPresentedWith(
          SIGN_IN_ALERTS["incorrect-credentials"]
        )
      })
    })

    test("sign in error flow, displays generic error alert", async () => {
      signIn.mockRejectedValueOnce(new Error("AWS died"))

      const { result } = renderUseSignInForm()
      act(() => result.current.onPasswordChanged("1234"))
      act(() => result.current.onEmailPhoneTextChanged("(111) 111-1111"))
      act(() => (result.current.submission as any).submit())

      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenPresentedWith(
          SIGN_IN_ALERTS.genericError
        )
      })
    })

    const signIn = jest.fn()
    const onSuccess = jest.fn()

    const { alertPresentationSpy } = captureAlerts()

    const renderUseSignInForm = () => {
      return renderHook(() => useSignInForm({ signIn, onSuccess }), {
        wrapper: ({ children }: any) => (
          <TestQueryClientProvider>{children}</TestQueryClientProvider>
        )
      })
    }
  })
})
