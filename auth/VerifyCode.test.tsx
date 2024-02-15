import { captureAlerts } from "@test-helpers/Alerts"
import { neverPromise } from "@test-helpers/Promise"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { withAnimatedTimeTravelEnabled } from "@test-helpers/Timers"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import { useAuthVerificationCodeForm } from "./VerifyCode"

describe("VerifyCode tests", () => {
  beforeEach(() => jest.resetAllMocks())

  afterEach(async () => {
    // resolve "Warning: An update to ForwardRef inside a test was not wrapped in act(...)."
    await act(async () => {
      await Promise.resolve()
    })
  })
  withAnimatedTimeTravelEnabled()
  describe("useAuthVerificationCodeForm tests", () => {
    beforeEach(() => jest.resetAllMocks())

    afterEach(async () => {
      // resolve "Warning: An update to ForwardRef inside a test was not wrapped in act(...)."
      await act(async () => {
        await Promise.resolve()
      })
    })
    withAnimatedTimeTravelEnabled()
    it("should be in an invalid state when code is less than 6 digits", async () => {
      const { result } = renderUseAuthVerificationCodeForm()

      act(() => result.current.onCodeChanged(""))

      await waitFor(() => {
        expect(result.current.submission).toMatchObject({
          status: "invalid",
          reason: "code-too-short"
        })
      })
    })

    it("should be in an invalid state when code is longer than 6 digits", async () => {
      const { result } = renderUseAuthVerificationCodeForm()

      act(() => result.current.onCodeChanged("1234567"))

      await waitFor(() => {
        expect(result.current.submission).toMatchObject({
          status: "invalid",
          reason: "code-too-long"
        })
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
      submitCode
        .mockResolvedValueOnce({ isCorrect: false })
        .mockResolvedValueOnce({ isCorrect: true, data: "cool" })

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

      await waitFor(() => expect(onSuccess).toHaveBeenCalledWith("cool"))
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
      await waitFor(() => {
        expect(result.current.submission).toMatchObject({
          status: "invalid",
          reason: "invalid-code"
        })
      })
    })

    test("previous invalid codes are always invalid", async () => {
      submitCode.mockResolvedValue({ isCorrect: false })
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
      await waitFor(() => {
        expect(result.current.submission).toMatchObject({
          status: "invalid",
          reason: "invalid-code"
        })
      })

      act(() => result.current.onCodeChanged(invalidCode2))
      await waitFor(() => {
        expect(result.current.submission).toMatchObject({
          status: "invalid",
          reason: "invalid-code"
        })
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
