import HexColorPicker, {
  HexColorPickerOption
} from "../formComponents/HexColorPicker"
import { EventColors } from "../../lib/events/EventColors"
import React from "react"
import { useEventFormField } from "."

/**
 * A color picker for an event form.
 */
export const EventFormColorPicker = () => {
  const [color, setColor] = useEventFormField("color")
  return (
    <HexColorPicker
      color={color}
      options={eventColorOptions}
      onChange={setColor}
    />
  )
}

const eventColorOptions = [
  { color: EventColors.Red, accessibilityLabel: "Red" },
  { color: EventColors.Orange, accessibilityLabel: "Orange" },
  { color: EventColors.Yellow, accessibilityLabel: "Yellow" },
  { color: EventColors.BrightPink, accessibilityLabel: "Bright Pink" },
  { color: EventColors.CherryBlossom, accessibilityLabel: "Cherry Blossom" },
  { color: EventColors.LightBlue, accessibilityLabel: "Light Blue" },
  { color: EventColors.LightPurple, accessibilityLabel: "Light Purple" },
  { color: EventColors.Blue, accessibilityLabel: "Blue" },
  { color: EventColors.Purple, accessibilityLabel: "Purple" },
  { color: EventColors.Turquoise, accessibilityLabel: "Turquoise" },
  { color: EventColors.Green, accessibilityLabel: "Green" },
  { color: EventColors.Brown, accessibilityLabel: "Brown" }
] as HexColorPickerOption[]
