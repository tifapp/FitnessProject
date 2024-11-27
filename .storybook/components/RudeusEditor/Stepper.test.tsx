import { act, renderHook } from "@testing-library/react-native"
import { useState } from "react"
import { fakeTimers } from "@test-helpers/Timers"
import { UseRudeusStepperProps, useRudeusStepper } from "./Stepper"

describe("RudeusStepper tests", () => {
  describe("UseRudeusStepper tests", () => {
    fakeTimers()

    it("should increment the number while in increment mode", () => {
      const { result } = renderUseRudeusStepper()
      act(() => result.current.steppingBegan("inc"))
      expect(result.current.value).toEqual(0.01)
      act(() => jest.advanceTimersByTime(100))
      expect(result.current.value).toEqual(0.02)
      act(() => jest.advanceTimersByTime(100))
      expect(result.current.value).toEqual(0.03)
      expect(result.current.canStep("inc")).toEqual(true)
    })

    it("should decrement the number while in decrement mode", () => {
      const { result } = renderUseRudeusStepper(-1)
      act(() => result.current.steppingBegan("dec"))
      expect(result.current.value).toEqual(-0.01)
      act(() => jest.advanceTimersByTime(100))
      expect(result.current.value).toEqual(-0.02)
      act(() => jest.advanceTimersByTime(100))
      expect(result.current.value).toEqual(-0.03)
      expect(result.current.canStep("dec")).toEqual(true)
    })

    it("should not increment past the maximum value", () => {
      const { result } = renderUseRudeusStepper(0, 0.01)
      act(() => result.current.steppingBegan("inc"))
      expect(result.current.value).toEqual(0.01)
      act(() => jest.advanceTimersByTime(100))
      expect(result.current.value).toEqual(0.01)
      expect(result.current.canStep("inc")).toEqual(false)
    })

    it("should not decrement past the minimum value", () => {
      const { result } = renderUseRudeusStepper(-0.01)
      act(() => result.current.steppingBegan("dec"))
      expect(result.current.value).toEqual(-0.01)
      act(() => jest.advanceTimersByTime(100))
      expect(result.current.value).toEqual(-0.01)
      expect(result.current.canStep("dec")).toEqual(false)
    })

    it("should stop incrementing when stepping ended", () => {
      const { result } = renderUseRudeusStepper()
      act(() => result.current.steppingBegan("inc"))
      expect(result.current.value).toEqual(0.01)
      act(() => jest.advanceTimersByTime(100))
      expect(result.current.value).toEqual(0.02)
      act(() => result.current.steppingEnded())
      act(() => jest.advanceTimersByTime(100))
      expect(result.current.value).toEqual(0.02)
    })

    it("should update the value when the user enters a number into the stepper", () => {
      const { result } = renderUseRudeusStepper()
      act(() => result.current.numberEntered("2"))
      expect(result.current.value).toEqual(2)
      expect(result.current.text).toEqual("2.00")
    })

    it("should not update the value when the user enters NaN into the stepper", () => {
      const { result } = renderUseRudeusStepper()
      act(() => result.current.numberEntered("djihdk"))
      expect(result.current.value).toEqual(0)
      expect(result.current.text).toEqual("djihdk")
    })

    it("should update the text when the number is changed externally", () => {
      const { result } = renderUseRudeusStepper()
      act(() => result.current.setValue(3.383783))
      expect(result.current.value).toEqual(3.383783)
      expect(result.current.text).toEqual("3.38")
    })

    const useTest = (
      props: Pick<UseRudeusStepperProps, "minimumValue" | "maximumValue">
    ) => {
      const [value, setValue] = useState(0)
      const state = useRudeusStepper({
        value,
        onValueChanged: setValue,
        ...props
      })
      return { value, setValue, ...state }
    }

    const renderUseRudeusStepper = (
      min: number = 0,
      max: number = Infinity
    ) => {
      return renderHook(useTest, {
        initialProps: { minimumValue: min, maximumValue: max }
      })
    }
  })
})
