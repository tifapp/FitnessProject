import HexColorPicker, {
  HexColorPickerOption
} from "@components/formComponents/HexColorPicker"
import { HexColor } from "@lib/Color"
import { HapticsProvider } from "@lib/Haptics"
import { fireEvent, render, screen } from "@testing-library/react-native"
import { useState } from "react"
import { View } from "react-native"
import { TestHaptics } from "@test-helpers/Haptics"
import "@test-helpers/Matchers"

const testOptions = [
  { color: "#123456", accessibilityLabel: "#123456" },
  { color: "#abcdef", accessibilityLabel: "#abcdef" }
] as HexColorPickerOption[]

describe("HexColorPicker tests", () => {
  let haptics = new TestHaptics()
  beforeEach(() => {
    haptics = new TestHaptics()
    jest.resetAllMocks()
  })

  it("can change the selected color", () => {
    renderHexColorPicker(testOptions)
    selectColor(testOptions[1].color)
    expect(selectedColorElement(testOptions[1].color)).toBeDisplayed()
  })

  it("plays haptics when selecting the colour", async () => {
    renderHexColorPicker(testOptions)
    selectColor(testOptions[1].color)
    expect(haptics.playedEvents).toEqual([{ name: "selection" }])
  })

  const renderHexColorPicker = (options: HexColorPickerOption[]) => {
    render(<Test options={options} />)
  }

  const Test = ({ options }: { options: HexColorPickerOption[] }) => {
    const [color, setColor] = useState(options[0].color)

    return (
      <HapticsProvider isSupportedOnDevice={true} haptics={haptics}>
        <View testID={displayedColorId(color)}>
          <HexColorPicker color={color} onChange={setColor} options={options} />
        </View>
      </HapticsProvider>
    )
  }

  const displayedColorId = (color: HexColor) => `displayed-${color}`

  const selectedColorElement = (color: HexColor) => {
    return screen.queryByTestId(displayedColorId(color))
  }

  const selectColor = (color: HexColor) => {
    fireEvent.press(screen.getByLabelText(color))
  }
})
