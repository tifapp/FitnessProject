import { act, renderHook, waitFor } from "@testing-library/react-native"
import {
  TestQueryClientProvider,
  createTestQueryClient
} from "../tests/helpers/ReactQuery"
import { useForgotPasswordForm } from "./ForgotPasswordForm"
describe("Forgot Password Form tests", () => {
  describe("Verify Email logic tests", () => {
    const queryClient = createTestQueryClient()
    beforeEach(() => queryClient.clear())

    afterAll(() => {
      queryClient.resetQueries()
      queryClient.clear()
    })

    const confirmedEmail = jest.fn()
    const onSuccess = jest.fn()

    const renderForgotPassword = () => {
      return renderHook(
        () =>
          useForgotPasswordForm({
            onSubmitted: confirmedEmail,
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
    it("can verify an email and send back an error for invalid emails", () => {
      const emailAddress = "FiddleSticks32@ka"
      const { result } = renderForgotPassword()

      act(() => result.current.updateField(emailAddress))

      expect(result.current.submission).toMatchObject({
        status: "invalid",
        error: "invalid-email"
      })
    })

    it("can correctly use its logic to proceed onto the next screen after a successful verification", async () => {
      const emailAddress = "FiddleSticks32@kale.org"
      const { result } = renderForgotPassword()

      act(() => result.current.updateField(emailAddress))

      expect(result.current.submission.status).toEqual("valid")

      act(() => result.current.submission.submit?.())

      await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    })
  })
})
