import {
  durationAtPosition,
  endBound,
  initialPickerState,
  layoutForDuration,
  pickerStateEntries,
  updateLayout
} from "./DurationPicker"

describe("EditEventDurationPicker tests", () => {
  describe("EditEventDurationPickerState tests", () => {
    it("should sort the presets when creating an initial state", () => {
      const durations = [1, 4, 3, 2, 5]
      const state = initialPickerState(durations)
      expect(Array.from(state.keys())).toEqual([1, 2, 3, 4, 5])
    })

    it("should fill in default values when less than 3 initital durations", () => {
      const durations = [2700, 3000]
      const state = initialPickerState(durations)
      expect(Array.from(state.keys())).toEqual([1800, 2700, 3000, 3600])
    })

    it("should return 0 for the end bound when no layout for ending duration", () => {
      const state = initialPickerState([1, 2, 3, 4, 5])
      expect(endBound(state)).toEqual(0)
    })

    it("should return the x value of the last duration for the end bound", () => {
      let state = initialPickerState([1, 2, 3, 4, 5])
      state = updateLayout(state, 5, testLayout(100))
      expect(endBound(state)).toEqual(100)
    })

    it("should return the duration for an x-position", () => {
      let state = initialPickerState([1, 2, 3, 4, 5])
      state = updateLayout(state, 1, testLayout(20))
      state = updateLayout(state, 2, testLayout(40))
      state = updateLayout(state, 3, testLayout(60))
      state = updateLayout(state, 4, testLayout(80))
      state = updateLayout(state, 5, testLayout(100))
      const entries = pickerStateEntries(state)
      expect(durationAtPosition(entries, -10)).toEqual(1)
      expect(durationAtPosition(entries, 8)).toEqual(1)
      expect(durationAtPosition(entries, 12)).toEqual(1)
      expect(durationAtPosition(entries, 24)).toEqual(1)
      expect(durationAtPosition(entries, 31)).toEqual(2)
      expect(durationAtPosition(entries, 33)).toEqual(2)
      expect(durationAtPosition(entries, 46)).toEqual(2)
      expect(durationAtPosition(entries, 50)).toEqual(3)
      expect(durationAtPosition(entries, 62)).toEqual(3)
      expect(durationAtPosition(entries, 77)).toEqual(4)
      expect(durationAtPosition(entries, 83)).toEqual(4)
      expect(durationAtPosition(entries, 90)).toEqual(5)
      expect(durationAtPosition(entries, 120)).toEqual(5)
    })

    it("should return the layout for a duration", () => {
      let state = initialPickerState([10, 20, 30, 40, 50])
      state = updateLayout(state, 10, testLayout(20))
      state = updateLayout(state, 20, testLayout(40))
      state = updateLayout(state, 30, testLayout(60))
      state = updateLayout(state, 40, testLayout(80))
      state = updateLayout(state, 50, testLayout(100))
      const entries = pickerStateEntries(state)
      expect(layoutForDuration(entries, 5)).toEqual(testLayout(12))
      expect(layoutForDuration(entries, 10)).toEqual(testLayout(12))
      expect(layoutForDuration(entries, 15)).toEqual(testLayout(30))
      expect(layoutForDuration(entries, 20)).toEqual(testLayout(32))
      expect(layoutForDuration(entries, 45)).toEqual(testLayout(90))
      expect(layoutForDuration(entries, 50)).toEqual(testLayout(100))
      expect(layoutForDuration(entries, 55)).toEqual(testLayout(100))
    })
  })

  const testLayout = (x: number) => ({
    x,
    y: 16,
    width: 20,
    height: 80
  })
})
