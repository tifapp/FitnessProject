import HexColorPicker, {
  HexColorPickerOption
} from "@components/formComponents/HexColorPicker"
import { HexColor } from "@lib/Color"
import { SetDependencyValue } from "@lib/dependencies"
import { HapticEvent, hapticsDependencyKey } from "@lib/Haptics"
import { fireEvent, render, screen } from "@testing-library/react-native"
import { useState } from "react"
import { View } from "react-native"
import { setPlatform } from "../helpers/Platform"
import "../helpers/Matchers"

const testOptions = [
  { color: "#123456", accessibilityLabel: "#123456" },
  { color: "#abcdef", accessibilityLabel: "#abcdef" }
] as HexColorPickerOption[]

describe("HexColorPicker tests", () => {
  beforeEach(() => jest.resetAllMocks())

  it("can change the selected color", () => {
    renderHexColorPicker(testOptions)
    selectColor(testOptions[1].color)
    expect(selectedColorElement(testOptions[1].color)).toBeDisplayed()
  })

  it("does not play haptics on android when selection changes", () => {
    setPlatform("android")
    renderHexColorPicker(testOptions)
    selectColor(testOptions[1].color)
    expect(hapticsPlayer).not.toHaveBeenCalled()
  })

  it("plays haptics on iOS when the color selection changes", () => {
    setPlatform("ios")
    renderHexColorPicker(testOptions)
    selectColor(testOptions[1].color)
    expect(hapticsPlayer).toHaveBeenCalledWith(HapticEvent.SelectionChanged)
  })
})

const renderHexColorPicker = (options: HexColorPickerOption[]) => {
  render(<Test options={options} />)
}

const hapticsPlayer = jest.fn()

const Test = ({ options }: { options: HexColorPickerOption[] }) => {
  const [color, setColor] = useState(options[0].color)
  return (
    <SetDependencyValue forKey={hapticsDependencyKey} value={hapticsPlayer}>
      <View testID={displayedColorId(color)}>
        <HexColorPicker color={color} onChange={setColor} options={options} />
      </View>
    </SetDependencyValue>
  )
}

const displayedColorId = (color: HexColor) => `displayed-${color}`

const selectedColorElement = (color: HexColor) => {
  return screen.queryByTestId(displayedColorId(color))
}

const selectColor = (color: HexColor) => {
  fireEvent.press(screen.getByLabelText(color))
}
