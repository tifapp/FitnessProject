import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider
} from "@gorhom/bottom-sheet"
import { useLastDefinedValue } from "@hooks/useLastDefinedValue"
import { FontScaleFactors, useFontScale } from "@lib/FontScale"
import React, { useEffect, useMemo, useRef } from "react"
import { StyleSheet } from "react-native"
import { EventFormAdvancedSettings } from "./AdvancedSettings"
import { EventFormColorPicker } from "./ColorPicker"
import { EventFormDatePicker } from "./DatePicker"
import { useEventFormContext } from "./EventForm"
import { EventFormSectionHeader } from "./SectionHeader"

/**
 * A bottom sheet which displays the current section in an `EventForm`.
 */
export const EventFormBottomSheet = () => {
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const { currentPresentedSection: currentSection, dismissCurrentSection } =
    useEventFormContext()
  const displayedSection = useLastDefinedValue(currentSection)
  const snapPoints = useSnapPoints()

  useEffect(() => {
    if (currentSection) {
      bottomSheetRef.current?.present()
    } else {
      bottomSheetRef.current?.dismiss()
    }
  }, [currentSection])

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        handleStyle={styles.handle}
        onDismiss={dismissCurrentSection}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={1}
            animatedIndex={{ value: 1 }}
          />
        )}
      >
        {displayedSection === "date" && (
          <EventFormSectionHeader title="Start and End Dates">
            <EventFormDatePicker />
          </EventFormSectionHeader>
        )}
        {displayedSection === "color" && (
          <EventFormSectionHeader title="Colors">
            <EventFormColorPicker />
          </EventFormSectionHeader>
        )}
        {displayedSection === "advanced" && (
          <EventFormSectionHeader title="Advanced Settings">
            <EventFormAdvancedSettings />
          </EventFormSectionHeader>
        )}
      </BottomSheetModal>
    </BottomSheetModalProvider>
  )
}

const useSnapPoints = () => {
  const fontScale = useFontScale()
  return useMemo(
    () => (fontScale > FontScaleFactors.xxxLarge ? ["60%"] : ["35%"]),
    [fontScale]
  )
}

const styles = StyleSheet.create({
  handle: {
    opacity: 0
  }
})
