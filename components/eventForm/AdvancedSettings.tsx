import React from "react"
import { Switch } from "react-native"
import { useEventFormField } from "."

/**
 * Advanced settings (hiding after start date, etc.) view for the event form.
 */
export const EventFormAdvancedSettings = () => {
  const [shouldHide, setShouldHide] = useEventFormField(
    "shouldHideAfterStartDate"
  )
  return (
    <Switch
      accessibilityRole="togglebutton"
      value={shouldHide}
      onValueChange={setShouldHide}
    />
  )
}
