import HexColorPicker, {
  HexColorPickerOption
} from "../formComponents/HexColorPicker"
import React from "react"
import { useEventFormField } from "./EventFormProvider"
import { EventColors } from "@lib/events/EventColors"

/**
 * A color picker for an event form.
 */
export const EventFormColorPicker = () => {
  const [color, setColor] = useEventFormField("color")
  return (
    <HexColorPicker
      color={color}
      options={eventColorPickerOptions}
      onChange={(value) => setColor(value)}
    />
  )
}

export const eventColorPickerOptions = Object.entries(EventColors).map(
  ([name, color]) => ({
    accessibilityLabel: name,
    color
  })
) as HexColorPickerOption<EventColors>[]
