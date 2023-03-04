import HexColorPicker, {
  HexColorPickerOption
} from "../formComponents/HexColorPicker"
import { EventColor, EventColors } from "../../lib/events/EventColors"
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
      onChange={(value: EventColor) => setColor(value)}
    />
  )
}

const eventColorOptions = [
  { color: EventColors.Red, accessibilityLabel: "Red" },
  { color: EventColors.Orange, accessibilityLabel: "Orange" },
  { color: EventColors.Pink, accessibilityLabel: "Pink" },
  { color: EventColors.Yellow, accessibilityLabel: "Yellow" },
  { color: EventColors.Green, accessibilityLabel: "Green" },
  { color: EventColors.Purple, accessibilityLabel: "Purple" },
  { color: EventColors.Blue, accessibilityLabel: "Blue" }
] as HexColorPickerOption<EventColor>[]
