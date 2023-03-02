import React, { createContext, ReactNode, useContext, useRef } from "react"
import { Button, Text, View } from "react-native"
import { useEventFormField, useEventFormValue } from "./EventForm"
import { TouchableOpacity } from "react-native-gesture-handler"
import DateTimePicker from "@components/formComponents/DateTimePicker"
import { HexColorPickerOption } from "@components/formComponents/HexColorPicker"
import { EventColors } from "@lib/events/EventColors"
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView
} from "@gorhom/bottom-sheet"

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
    </ToolbarProvider>
  )
}

type ToolbarContextValues = {
  openSection: () => void
}

const ToolbarContext = createContext<ToolbarContextValues | undefined>(
  undefined
)

const useToolbar = () => useContext(ToolbarContext)!!

type ToolbarProviderProps = {
  children: ReactNode
}

const bottomSheetSnapPoints = ["50%"]

const ToolbarProvider = ({ children }: ToolbarProviderProps) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null)

  return (
    <ToolbarContext.Provider
      value={{
        openSection: () => {
          console.log("Opening section", bottomSheetRef.current)
          bottomSheetRef.current?.present()
        }
      }}
    >
      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={bottomSheetRef}
          snapPoints={bottomSheetSnapPoints}
        >
          <DateSection />
        </BottomSheetModal>
      </BottomSheetModalProvider>
      {children}
    </ToolbarContext.Provider>
  )
}

const DateTab = () => {
  const dateRange = useEventFormValue("dateRange")
  const { openSection } = useToolbar()
  return (
    // <TouchableOpacity onPress={openSection} accessibilityLabel="Update Dates">
    //   <Text>{dateRange.formatted()}</Text>
    // </TouchableOpacity>
    <Button title={dateRange.formatted()} onPress={openSection} />
  )
}

const DateSection = () => {
  return <Text>Start and End Dates</Text>
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
