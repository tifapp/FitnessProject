import { act, renderHook } from "@testing-library/react-native"
import { useDismissal } from "./UseDismissal"
import { AppStateProvider } from "@lib/AppState"
import { AppState, AppStateStatus } from "react-native"

describe("UseDismissal tests", () => {
  const appStateSubscribe = jest.fn()

  it("should run the dismissal function when the component unmounts", () => {
    const callback = jest.fn()
    const { unmount } = renderUseDismissal(callback)
    expect(callback).not.toHaveBeenCalled()
    act(() => unmount())
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it("should run the dismissal function only when the app is not active", () => {
    let send: ((status: AppStateStatus) => void) | undefined
    appStateSubscribe.mockImplementationOnce((_, cb) => {
      send = cb
      return { remove: jest.fn() }
    })
    const callback = jest.fn()
    renderUseDismissal(callback)
    act(() => send?.("active"))
    expect(callback).not.toHaveBeenCalled()
    act(() => send?.("background"))
    expect(callback).toHaveBeenCalledTimes(1)
    act(() => send?.("inactive"))
    expect(callback).toHaveBeenCalledTimes(2)
  })

  const renderUseDismissal = (onDismiss: () => void) => {
    return renderHook(() => useDismissal(onDismiss), {
      wrapper: ({ children }: any) => (
        <AppStateProvider
          appState={{ ...AppState, addEventListener: appStateSubscribe }}
        >
          {children}
        </AppStateProvider>
      )
    })
  }
})
