import { defaultCreateAccessibilityLabel } from "@components/formComponents/HexColorPicker"

describe("HexColorPickerAccessibility tests", () => {
  test("random color is encoded in label", () => {
    expect(defaultCreateAccessibilityLabel("#abcdefg")).toEqual(
      "Color #abcdefg"
    )
  })
})
