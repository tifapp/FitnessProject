import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView
} from "@gorhom/bottom-sheet"
import { useLastDefinedValue } from "../../hooks/useLastDefinedValue"
import { FontScaleFactors, useFontScale } from "../../lib/FontScale"
import React, { useEffect, useMemo, useRef } from "react"
import { StyleSheet, Keyboard } from "react-native"
import { EventFormAdvancedSettings } from "./AdvancedSettings"
import { EventFormColorPicker } from "./ColorPicker"
import { EventFormDatePicker } from "./DatePicker"
import { EventFormSectionHeader } from "./SectionHeader"
import { useEventFormPresentedSection } from "./EventFormProvider"

/**
 * A bottom sheet which displays the current section in an `EventForm`.
 */
export const EventFormBottomSheet = () => {
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const { presentedSection, dismissPresentedSection } =
    useEventFormPresentedSection()
  const displayedSection = useLastDefinedValue(presentedSection)
  const snapPoints = useSnapPoints()

  useEffect(() => {
    if (presentedSection) {
      Keyboard.dismiss()
      bottomSheetRef.current?.present()
    } else {
      bottomSheetRef.current?.dismiss()
    }
  }, [presentedSection])

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        onDismiss={dismissPresentedSection}
        handleStyle={styles.handle}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} animatedIndex={{ value: 1 }} />
        )}
      >
        <BottomSheetView>
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
        </BottomSheetView>
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
