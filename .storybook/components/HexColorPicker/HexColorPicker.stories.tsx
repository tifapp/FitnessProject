import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React, { useState } from "react"
import { EventColors } from "../../../lib/events/EventColors"
import HexColorPicker, {
  HexColorPickerProps
} from "../../../components/formComponents/HexColorPicker"
import { eventColorPickerOptions } from "../../../components/eventForm"

const Picker = (props: HexColorPickerProps) => {
  const [color, setColor] = useState(EventColors.Red)
  return <HexColorPicker {...props} color={color} onChange={setColor} />
}

const HexColorPickerMeta: ComponentMeta<typeof HexColorPicker> = {
  title: "HexColorPicker",
  component: Picker,
  args: {
    options: eventColorPickerOptions,
    style: {
      display: "flex",
      justifyContent: "center",
      alignContent: "flex-start"
    }
  }
}

export default HexColorPickerMeta

type HexColorPickerStory = ComponentStory<typeof HexColorPicker>

export const Grid: HexColorPickerStory = (args) => <Picker {...args} />
