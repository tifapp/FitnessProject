import { act, renderHook, waitFor } from "@testing-library/react-native"
import { captureAlerts } from "../../tests/helpers/Alerts"
import {
  TestQueryClientProvider,
  createTestQueryClient
} from "../../tests/helpers/ReactQuery"
import { useForgotPasswordForm } from "./ForgotPasswordForm"
describe("Forgot Password Form tests", () => {
  describe("Verify Email logic tests", () => {
    const queryClient = createTestQueryClient()
    beforeEach(() => queryClient.clear())

    afterAll(() => {
      queryClient.resetQueries()
      queryClient.clear()
    })

    const emailOrPhone = jest.fn()
    const onSuccess = jest.fn()

    const renderForgotPassword = () => {
      return renderHook(
        () =>
          useForgotPasswordForm({
            initiateForgotPassword: emailOrPhone,
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

    const { alertPresentationSpy } = captureAlerts()

    it("can verify an email and send back an error for invalid emails", () => {
      const emailAddress = "FiddleSticks32ka"
      const { result } = renderForgotPassword()

      act(() =>
        result.current.forgotPasswordText.onActiveTextTypeChanged("email")
      )
      act(() => result.current.forgotPasswordText.onTextChanged(emailAddress))

      expect(result.current.submission).toMatchObject({
        status: "invalid",
        error: "invalid-email"
      })
    })

    it("can verify a phone number and send back an error for invalid phone numbers", () => {
      const phoneNumber = "833412412"
      const { result } = renderForgotPassword()

      act(() =>
        result.current.forgotPasswordText.onActiveTextTypeChanged("phone")
      )
      act(() => result.current.forgotPasswordText.onTextChanged(phoneNumber))

      expect(result.current.submission).toMatchObject({
        status: "invalid",
        error: "invalid-phone-number"
      })
    })

    it("can correctly use its logic to proceed onto the next screen after a successful verification", async () => {
      const emailAddress = "FiddleSticks32@kale.org"
      const { result } = renderForgotPassword()

      act(() =>
        result.current.forgotPasswordText.onActiveTextTypeChanged("email")
      )
      act(() => result.current.forgotPasswordText.onTextChanged(emailAddress))

      expect(result.current.submission.status).toEqual("submittable")

      act(() => (result.current.submission as any).submit())

      await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    })

    it("can properly display an alert on an error", async () => {
      emailOrPhone.mockRejectedValue(new Error())
      const emailAddress = "FiddleSticks32@kale.org"
      const { result } = renderForgotPassword()

      act(() =>
        result.current.forgotPasswordText.onActiveTextTypeChanged("email")
      )
      act(() => result.current.forgotPasswordText.onTextChanged(emailAddress))

      expect(result.current.submission.status).toEqual("submittable")

      act(() => (result.current.submission as any).submit())

      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenCalled()
      })
    })
  })
})
