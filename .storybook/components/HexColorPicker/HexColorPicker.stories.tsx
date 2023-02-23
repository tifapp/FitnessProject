import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React, { useState } from "react"
import { HexColor } from "../../../lib/Color"
import HexColorPicker, {
  HexColorPickerProps
} from "../../../components/formComponents/HexColorPicker"

const colors: HexColor[] = [
  "#FC9F5B",
  "#FBD1A2",
  "#ECE4B7",
  "#7DCFB6",
  "#33CA7F",
  "#071E22",
  "#1D7874",
  "#679289",
  "#F4C095",
  "#EE2E31"
]

const Picker = (props: HexColorPickerProps) => {
  const [color, setColor] = useState(colors[0])
  return <HexColorPicker {...props} color={color} onChange={setColor} />
}

const HexColorPickerMeta: ComponentMeta<typeof HexColorPicker> = {
  title: "HexColorPicker",
  component: Picker,
  argTypes: {
    onChange: { action: "color changed" }
  },
  args: {
    options: colors
  }
}

export default HexColorPickerMeta

type HexColorPickerStory = ComponentStory<typeof HexColorPicker>

export const Grid: HexColorPickerStory = (args) => <Picker grid {...args} />
export const Scroll: HexColorPickerStory = (args) => <Picker {...args} />
