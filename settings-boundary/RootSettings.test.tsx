import { act, renderHook } from "@testing-library/react-native"
import { ALVIS_QUOTES, useRootSettingsVersionQuote } from "./RootSettings"

describe("RootSettings tests", () => {
  describe("UseRootSettingsVersionQuote tests", () => {
    it("should display an alvis quote after 20 version number taps", () => {
      const { result } = renderUseRootSettingsVersionQuote(() => 0)
      for (let i = 0; i < 19; i++) {
        act(() => result.current.versionNumberTapped())
        expect(result.current.quote).toBeUndefined()
      }
      act(() => result.current.versionNumberTapped())
      expect(result.current.quote).toEqual(ALVIS_QUOTES[0])
    })

    const renderUseRootSettingsVersionQuote = (random: () => number) => {
      return renderHook(() => useRootSettingsVersionQuote(random))
    }
  })
})
