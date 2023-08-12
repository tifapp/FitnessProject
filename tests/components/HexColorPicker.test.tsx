import HexColorPicker, {
  HexColorPickerOption
} from "@components/formComponents/HexColorPicker"
import { HexColor } from "@lib/Color"
import {
  ExpoHapticsImplementation,
  ExpoHapticsImplementationProvider
} from "@lib/Haptics"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { fireEvent, render, screen } from "@testing-library/react-native"
import { useState } from "react"
import { View } from "react-native"
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

  it("checks the current haptics value", async () => {
    renderHexColorPicker(testOptions)
    selectColor(testOptions[1].color)
    expect(AsyncStorage.getItem("haptics on/off")).toEqual(true)
  })
})

const renderHexColorPicker = (options: HexColorPickerOption[]) => {
  render(<Test options={options} />)
}

const Test = ({ options }: { options: HexColorPickerOption[] }) => {
  const [color, setColor] = useState(options[0].color)

  return (
    <ExpoHapticsImplementationProvider
      haptics={new ExpoHapticsImplementation()}
    >
      <View testID={displayedColorId(color)}>
        <HexColorPicker color={color} onChange={setColor} options={options} />
      </View>
    </ExpoHapticsImplementationProvider>
  )
}

const displayedColorId = (color: HexColor) => `displayed-${color}`

const selectedColorElement = (color: HexColor) => {
  return screen.queryByTestId(displayedColorId(color))
}

const selectColor = (color: HexColor) => {
  fireEvent.press(screen.getByLabelText(color))
}
