import HexColorPicker, {
  defaultCreateAccessibilityLabel
} from "@components/formComponents/HexColorPicker"
import { HexColor } from "@lib/Color"
import { SetDependencyValue } from "@lib/dependencies"
import { HapticEvent, hapticsDependencyKey } from "@lib/Haptics"
import { fireEvent, render, screen } from "@testing-library/react-native"
import { useState } from "react"
import { View } from "react-native"
import { setPlatform } from "../helpers/Platform"
import "../helpers/Matchers"

const testColors: HexColor[] = ["#123456", "#abcdef"]

describe("HexColorPicker tests", () => {
  it("can change the selected color", () => {
    renderHexColorPicker(testColors)
    selectColor(testColors[1])
    expect(selectedColorElement(testColors[1])).toBeDisplayed()
  })

  it("plays haptics on iOS when the color selection changes", () => {
    setPlatform("ios")
    renderHexColorPicker(testColors)
    selectColor(testColors[1])
    expect(hapticsPlayer).toHaveBeenCalledWith(HapticEvent.SelectionChanged)
  })

  test("default accessibility label creator", () => {
    expect(defaultCreateAccessibilityLabel("#abcdefg")).toEqual(
      "Color #abcdefg"
    )
  })
})

const renderHexColorPicker = (options: HexColor[]) => {
  render(<Test options={options} />)
}

const hapticsPlayer = jest.fn()

const Test = ({ options }: { options: HexColor[] }) => {
  const [color, setColor] = useState(options[0])
  return (
    <SetDependencyValue forKey={hapticsDependencyKey} value={hapticsPlayer}>
      <View testID={displayedColorId(color)}>
        <HexColorPicker
          color={color}
          onChange={setColor}
          options={options}
          createAccessibilityLabel={(color) => color}
        />
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
