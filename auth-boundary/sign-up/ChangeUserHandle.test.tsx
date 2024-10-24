import { captureAlerts } from "@test-helpers/Alerts"
import { neverPromise } from "@test-helpers/Promise"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { timeTravel, fakeTimers } from "@test-helpers/Timers"
import { renderHook, waitFor } from "@testing-library/react-native"
import { act } from "react-test-renderer"
import { useSignUpChangeUserHandleForm } from "./ChangeUserHandle"
import { UserHandle } from "TiFShared/domain-models/User"

describe("SignUpChangeUserHandle tests", () => {
  beforeEach(() => jest.resetAllMocks())

  describe("useSignUpChangeUserHandle tests", () => {
    fakeTimers()

    it("should debounce when looking up a new user handle", async () => {
      checkIfUserHandleTaken.mockResolvedValueOnce(true)

      const { result } = renderUseSignUpChangeUserHandle("elon_musk", 300)

      act(() => result.current.onHandleTextChanged("musk_elon"))
      expect(result.current.handleText).toEqual("musk_elon")
      expect(result.current.isPerformingUserHandleTakenCheck).toEqual(true)

      act(timeTravel)
      expect(result.current.submission.status).toEqual("submittable")

      act(() => result.current.onHandleTextChanged("melon_husk"))
      expect(result.current.handleText).toEqual("melon_husk")

      act(timeTravel)
      expect(result.current.submission.status).toEqual("submittable")

      act(timeTravel)
      await waitFor(() => {
        expect(result.current.submission).toMatchObject({
          status: "invalid",
          reason: "already-taken"
        })
      })
      expect(result.current.isPerformingUserHandleTakenCheck).toEqual(false)
    })

    it("should not perform a validation check on initial handle", async () => {
      checkIfUserHandleTaken.mockResolvedValueOnce(true)

      const { result } = renderUseSignUpChangeUserHandle("elon_musk", 300)

      await waitFor(() => expect(checkIfUserHandleTaken).not.toHaveBeenCalled())
      expect(result.current.submission.status).toEqual("submittable")
    })

    it("should be in an invalid state when invalid user handle text is entered", () => {
      const { result } = renderUseSignUpChangeUserHandle("bichell_dickle", 200)

      act(() => result.current.onHandleTextChanged("bitchell_di:"))
      expect(result.current.submission).toMatchObject({
        status: "invalid",
        reason: "bad-format"
      })
    })

    it("should be in submitting state when submitted", async () => {
      changeUserHandle.mockImplementationOnce(neverPromise)
      const { result } = renderUseSignUpChangeUserHandle("bichell_dickle", 200)

      act(() => result.current.onHandleTextChanged("abc"))
      act(() => (result.current.submission as any).submit())
      await waitFor(() => {
        expect(result.current.submission.status).toEqual("submitting")
      })
    })

    test("valid submission flow", async () => {
      const handleTextToSubmit = "elon_musk"
      changeUserHandle.mockImplementationOnce((handle: UserHandle) => {
        if (handle.rawValue === handleTextToSubmit) {
          return Promise.resolve()
        }
        return Promise.reject(new Error())
      })
      checkIfUserHandleTaken.mockResolvedValueOnce(false)
      const { result } = renderUseSignUpChangeUserHandle("bichell_dickle", 200)

      act(() => result.current.onHandleTextChanged(handleTextToSubmit))
      act(() => (result.current.submission as any).submit())
      await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    })

    it("should present an alert when an error occurs with submitting", async () => {
      changeUserHandle.mockRejectedValueOnce(new Error())
      const { result } = renderUseSignUpChangeUserHandle("bichell_dickle", 200)

      act(() => result.current.onHandleTextChanged("abc"))
      act(() => (result.current.submission as any).submit())
      await waitFor(() => expect(alertPresentationSpy).toHaveBeenCalled())
    })

    it("should not fully submit new handle when new handle is the same as initial handle", async () => {
      changeUserHandle.mockRejectedValueOnce(new Error())
      const { result } = renderUseSignUpChangeUserHandle("bichell_dickle", 200)

      act(() => (result.current.submission as any).submit())
      await waitFor(() => expect(onSuccess).toHaveBeenCalled())
      expect(changeUserHandle).not.toHaveBeenCalled()
    })

    it("should not fully submit new handle is the same as the previous submission handle", async () => {
      changeUserHandle
        .mockReturnValueOnce(Promise.resolve())
        .mockRejectedValueOnce(new Error())
      const { result } = renderUseSignUpChangeUserHandle("bichell_dickle", 200)

      act(() => result.current.onHandleTextChanged("abc"))

      act(() => (result.current.submission as any).submit())
      await waitFor(() => expect(onSuccess).toHaveBeenCalled())

      act(() => (result.current.submission as any).submit())
      await waitFor(() => expect(onSuccess).toHaveBeenCalled())
      expect(changeUserHandle).toHaveBeenCalledTimes(1)
    })

    const { alertPresentationSpy } = captureAlerts()

    const onSuccess = jest.fn()
    const changeUserHandle = jest.fn()
    const checkIfUserHandleTaken = jest.fn()

    const renderUseSignUpChangeUserHandle = (
      initialHandle: string,
      debounceMs: number
    ) => {
      const parsedHandle = UserHandle.parse(initialHandle).handle!
      return renderHook(
        () => {
          return useSignUpChangeUserHandleForm(parsedHandle, debounceMs, {
            checkIfUserHandleTaken,
            changeUserHandle,
            onSuccess
          })
        },
        {
          wrapper: ({ children }: any) => (
            <TestQueryClientProvider>{children}</TestQueryClientProvider>
          )
        }
      )
    }
  })
})
