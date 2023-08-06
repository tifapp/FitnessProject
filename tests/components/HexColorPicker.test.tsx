import HexColorPicker, {
  HexColorPickerOption
} from "@components/formComponents/HexColorPicker"
import { HexColor } from "@lib/Color"
import { HapticsManagerProvider } from "@lib/Haptics"
import { hapticsAtom } from "@lib/HapticsManager"
import { fireEvent, render, screen } from "@testing-library/react-native"
import { useState } from "react"
import { View } from "react-native"
import "../helpers/Matchers"

const turnOffHaptics = jest.fn()
const turnOnHaptics = jest.fn()
const startWithEvent = jest.fn()

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

  it("calls actOnEvent correctly", () => {
    renderHexColorPicker(testOptions)
    selectColor(testOptions[1].color)
    expect(startWithEvent).toHaveBeenCalled()
  })

  it("calls turnOffHaptics correctly and switches the current value to what it should be", async () => {
    renderHexColorPicker(testOptions)
    selectColor(testOptions[1].color)
    expect(hapticsAtom.read).toEqual(true)
  })
})

const renderHexColorPicker = (options: HexColorPickerOption[]) => {
  render(<Test options={options} />)
}

const Test = ({ options }: { options: HexColorPickerOption[] }) => {
  const [color, setColor] = useState(options[0].color)

  return (
    <HapticsManagerProvider
      play={startWithEvent}
      unmute={turnOnHaptics}
      mute={turnOffHaptics}
    >
      <View testID={displayedColorId(color)}>
        <HexColorPicker color={color} onChange={setColor} options={options} />
      </View>
    </HapticsManagerProvider>
  )
}

const displayedColorId = (color: HexColor) => `displayed-${color}`

const selectedColorElement = (color: HexColor) => {
  return screen.queryByTestId(displayedColorId(color))
}

const selectColor = (color: HexColor) => {
  fireEvent.press(screen.getByLabelText(color))
}
