import { useLastDefinedValue } from "@lib/utils/UseLastDefinedValue"
import { renderHook } from "@testing-library/react-native"

describe("useLastDefinedValue tests", () => {
  it("should cache the last defined value", () => {
    const { result, rerender } = renderHook((num: number | undefined) =>
      useLastDefinedValue(num)
    )
    rerender(1)
    expect(result.current).toEqual(1)

    rerender(undefined)
    expect(result.current).toEqual(1)

    rerender(2)
    expect(result.current).toEqual(2)

    rerender(undefined)
    expect(result.current).toEqual(2)
  })
})
