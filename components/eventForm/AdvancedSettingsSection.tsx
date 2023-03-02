import React from "react"
import { Switch } from "react-native"
import { useEventFormField } from "."

export const EventFormAdvancedSettingsSection = () => {
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
