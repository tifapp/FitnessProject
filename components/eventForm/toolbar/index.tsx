import React from "react"
import { Button, Text } from "react-native"
import { useEventFormValue } from "../EventForm"
import { TouchableOpacity } from "react-native-gesture-handler"
import { HexColorPickerOption } from "@components/formComponents/HexColorPicker"
import { EventColors } from "@lib/events/EventColors"
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
  const dateRange = useEventFormValue("dateRange")
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

const AdvancedTab = () => {
  const { openSection } = useToolbar()
  return (
    <TouchableOpacity
      accessibilityLabel="Advanced"
      onPress={() => openSection("advanced")}
    />
  )
}
