import React from "react"
import { Button, Text } from "react-native"
import { useEventFormContext } from ".."
import { TouchableOpacity } from "react-native-gesture-handler"
import { ToolbarProvider, useToolbar } from "./ToolbarProvider"

/**
 * A horizontally scrolling toolbar for an event form.
 *
 * Each tab on the toolbar opens a bottom sheet screen
 * where its respective form values can be edited.
 */
export const EventFormToolbar = () => {
  return (
    <ToolbarProvider>
      <DateTab />
      <ColorTab />
      <AdvancedTab />
    </ToolbarProvider>
  )
}

const DateTab = () => {
  const dateRange = useEventFormContext().watch("dateRange")
  const { openSection } = useToolbar()
  return (
    <TouchableOpacity
      onPress={() => openSection("date")}
      accessibilityLabel="Update Dates"
    >
      <Text>{dateRange.formatted()}</Text>
    </TouchableOpacity>
  )
}

const ColorTab = () => {
  const { openSection } = useToolbar()
  return <Button title="Color" onPress={() => openSection("color")} />
}

const AdvancedTab = () => {
  const { openSection } = useToolbar()
  return (
    <TouchableOpacity
      accessibilityLabel="Advanced Settings"
      onPress={() => openSection("advanced")}
    />
  )
}
