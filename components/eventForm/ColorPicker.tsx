import HexColorPicker from "../formComponents/HexColorPicker"
import React from "react"
import { useEventFormField } from "./EventForm"
import { eventColorOptions } from "./EventFormValues"

/**
 * A color picker for an event form.
 */
export const EventFormColorPicker = () => {
  const [color, setColor] = useEventFormField("color")
  return (
    <HexColorPicker
      color={color}
      options={eventColorOptions}
      onChange={(value) => setColor(value)}
    />
  )
}
