import { renderHook, waitFor } from "@testing-library/react-native"
import { useAuthVerificationCodeForm } from "./VerifyCode"
import { act } from "react-test-renderer"
import { TestQueryClientProvider } from "../tests/helpers/ReactQuery"
import { neverPromise } from "../tests/helpers/Promise"
import { captureAlerts } from "../tests/helpers/Alerts"

describe("VerifyCode tests", () => {
  beforeEach(() => jest.resetAllMocks())

  describe("useAuthVerificationCodeForm tests", () => {
    it("should be in an invalid state when code is less than 6 digits", () => {
      const { result } = renderUseAuthVerificationCodeForm()

      act(() => result.current.onCodeChanged(""))

      expect(result.current.submission).toMatchObject({
        status: "invalid",
        reason: "code-too-short"
      })
    })

    it("should be in an invalid state when code is longer than 6 digits", () => {
      const { result } = renderUseAuthVerificationCodeForm()

      act(() => result.current.onCodeChanged("1234567"))

      expect(result.current.submission).toMatchObject({
        status: "invalid",
        reason: "code-too-long"
      })
    })

    test("successful resend verification code flow", async () => {
      resendCode.mockReturnValueOnce(Promise.resolve())

      const { result } = renderUseAuthVerificationCodeForm()

      act(() => result.current.onCodeResent())
      await waitFor(() => {
        expect(result.current.resendCodeStatus).toEqual("success")
      })
    })

    test("errorful resend verification code flow", async () => {
      resendCode.mockRejectedValueOnce(new Error("We died"))

      const { result } = renderUseAuthVerificationCodeForm()

      act(() => result.current.onCodeResent())
      await waitFor(() => {
        expect(result.current.resendCodeStatus).toEqual("error")
      })
    })

    it("should be in a submitting state when in process of submitting code", async () => {
      submitCode.mockImplementationOnce(neverPromise)

      const { result } = renderUseAuthVerificationCodeForm()

      act(() => result.current.onCodeChanged("123456"))
      act(() => (result.current.submission as any).submit())

      await waitFor(() => {
        expect(result.current.submission.status).toEqual("submitting")
      })
    })

    test("submit invalid code, then resubmit valid code", async () => {
      submitCode.mockResolvedValueOnce(false).mockResolvedValueOnce(true)

      const { result } = renderUseAuthVerificationCodeForm()

      act(() => result.current.onCodeChanged("123456"))
      act(() => (result.current.submission as any).submit())

      await waitFor(() => {
        expect(result.current.submission).toMatchObject({
          status: "invalid",
          reason: "invalid-code"
        })
      })
      expect(alertPresentationSpy).toHaveBeenCalled()

      act(() => result.current.onCodeChanged("123457"))
      act(() => (result.current.submission as any).submit())

      await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    })

    test("submit invalid code, change code while submitting, retype invalid code after submission, stays invalid for retyped code", async () => {
      let resolveCheckCode: (value: boolean) => void
      submitCode.mockReturnValueOnce(
        new Promise<boolean>((resolve) => {
          resolveCheckCode = resolve
        })
      )
      const invalidCode = "123456"
      const codeToChangeToWhileSubmitting = "789012"

      const { result } = renderUseAuthVerificationCodeForm()

      act(() => result.current.onCodeChanged(invalidCode))
      act(() => (result.current.submission as any).submit())

      act(() => result.current.onCodeChanged(codeToChangeToWhileSubmitting))
      act(() => resolveCheckCode(false))

      await waitFor(() => {
        expect(result.current.submission.status).toEqual("submittable")
      })

      act(() => result.current.onCodeChanged(invalidCode))
      expect(result.current.submission).toMatchObject({
        status: "invalid",
        reason: "invalid-code"
      })
    })

    test("previous invalid codes are always invalid", async () => {
      submitCode.mockResolvedValue(false)
      const invalidCode = "123456"
      const invalidCode2 = "789012"

      const { result } = renderUseAuthVerificationCodeForm()

      act(() => result.current.onCodeChanged(invalidCode))
      act(() => (result.current.submission as any).submit())
      await waitFor(() => {
        expect(result.current.submission.status).toEqual("invalid")
      })

      act(() => result.current.onCodeChanged(invalidCode2))
      act(() => (result.current.submission as any).submit())
      await waitFor(() => {
        expect(result.current.submission.status).toEqual("invalid")
      })

      act(() => result.current.onCodeChanged(invalidCode))
      expect(result.current.submission).toMatchObject({
        status: "invalid",
        reason: "invalid-code"
      })

      act(() => result.current.onCodeChanged(invalidCode2))
      expect(result.current.submission).toMatchObject({
        status: "invalid",
        reason: "invalid-code"
      })
    })

    test("error submission flow", async () => {
      submitCode.mockRejectedValueOnce(new Error("Someone lied, people died"))

      const { result } = renderUseAuthVerificationCodeForm()

      act(() => result.current.onCodeChanged("123456"))
      act(() => (result.current.submission as any).submit())

      await waitFor(() => expect(alertPresentationSpy).toHaveBeenCalled())
    })

    const { alertPresentationSpy } = captureAlerts()

    const onSuccess = jest.fn()
    const submitCode = jest.fn()
    const resendCode = jest.fn()

    const renderUseAuthVerificationCodeForm = () => {
      return renderHook(
        () =>
          useAuthVerificationCodeForm({
            resendCode,
            submitCode,
            onSuccess
          }),
        {
          wrapper: ({ children }: any) => (
            <TestQueryClientProvider>{children}</TestQueryClientProvider>
          )
        }
      )
    }
  })
})
