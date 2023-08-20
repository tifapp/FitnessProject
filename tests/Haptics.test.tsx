import {
  Haptics,
  HapticsProvider,
  IS_HAPTICS_MUTED_KEY,
  useHaptics
} from "@lib/Haptics"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { TestHaptics } from "./helpers/Haptics"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import { Provider } from "jotai"

describe("Haptics tests", () => {
  describe("useHaptics tests", () => {
    beforeEach(async () => await AsyncStorage.clear())

    it("should persist mute state in AsyncStorage", async () => {
      const { result } = renderUseHaptics(new TestHaptics())

      act(() => result.current.mute())
      let isMuted = await AsyncStorage.getItem(IS_HAPTICS_MUTED_KEY)
      expect(isMuted).toEqual("true")

      act(() => result.current.unmute())
      isMuted = await AsyncStorage.getItem(IS_HAPTICS_MUTED_KEY)
      expect(isMuted).toEqual("false")
    })

    it("shouldn't play haptics when it's muted", async () => {
      const testHaptics = new TestHaptics()
      const { result } = renderUseHaptics(testHaptics)

      act(() => result.current.mute())
      await act(async () => await result.current.play({ name: "selection" }))

      expect(testHaptics.playedEvents).toEqual([])
    })

    it("should be able to mute underlying haptics when unmuted", () => {
      const testHaptics = new TestHaptics()
      const { result } = renderUseHaptics(testHaptics)

      act(() => result.current.mute())

      expect(testHaptics.isMuted).toEqual(true)
    })

    it("should play haptics when unmuted", async () => {
      const testHaptics = new TestHaptics()
      const { result } = renderUseHaptics(testHaptics)

      act(() => result.current.mute())
      act(() => result.current.unmute())
      await act(async () => await result.current.play({ name: "selection" }))

      expect(testHaptics.playedEvents).toEqual([{ name: "selection" }])
    })

    it("should be able to unmute underlying haptics when muted", () => {
      const testHaptics = new TestHaptics()
      testHaptics.mute()
      const { result } = renderUseHaptics(testHaptics)

      act(() => result.current.unmute())

      expect(testHaptics.isMuted).toEqual(false)
    })

    it("should mute when rendered if persisted value indicates mute", async () => {
      const testHaptics = new TestHaptics()
      testHaptics.unmute()
      await AsyncStorage.setItem(IS_HAPTICS_MUTED_KEY, "true")

      renderUseHaptics(testHaptics)

      await waitFor(() => expect(testHaptics.isMuted).toEqual(false))
      expect(testHaptics.isMuted).toEqual(true)
    })

    it("should unmute when rendered if persisted value indicates unmute", async () => {
      const testHaptics = new TestHaptics()
      testHaptics.mute()
      await AsyncStorage.setItem(IS_HAPTICS_MUTED_KEY, "false")

      renderUseHaptics(testHaptics)

      await waitFor(() => expect(testHaptics.isMuted).toEqual(false))
    })

    const renderUseHaptics = (haptics: Haptics) => {
      return renderHook(useHaptics, {
        wrapper: ({ children }: any) => (
          <Provider>
            <HapticsProvider isSupportedOnDevice={false} haptics={haptics}>
              {children}
            </HapticsProvider>
          </Provider>
        )
      })
    }
  })
})
