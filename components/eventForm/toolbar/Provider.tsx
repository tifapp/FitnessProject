import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
  BottomSheetScrollView
} from "@gorhom/bottom-sheet"
import { DynamicTypeSizes, useFontScale } from "@lib/FontScale"
import React, {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useRef,
  useState
} from "react"
import { StyleSheet } from "react-native"
import { EventFormAdvancedSettings } from "../AdvancedSettings"
import { EventFormColorPicker } from "../ColorPicker"
import { EventFormDatePicker } from "../DatePicker"
import { EventFormToolbarSection } from "./Section"

export type ToolbarSection = "date" | "color" | "advanced"

export type ToolbarContextValues = {
  openSection: (section: ToolbarSection) => void
  dismissCurrentSection: () => void
}

// NB: Programmer error if this is ever undefined.
export const useToolbar = () => {
  const toolbar = useContext(ToolbarContext)
  if (!toolbar) {
    throw new Error("Toolbar components must be provided with ToolbarProvider.")
  }
  return toolbar
}

export type ToolbarProviderProps = {
  children: ReactNode
}

export const ToolbarProvider = ({ children }: ToolbarProviderProps) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const [section, setSection] = useState<ToolbarSection | undefined>()
  const snapPoints = useSnapPoints()

  return (
    <ToolbarContext.Provider
      value={{
        // TODO: - Should this allow for pasing in an arbitrary snap point?
        openSection: (section) => {
          setSection(section)
          bottomSheetRef.current?.present()
        },
        dismissCurrentSection: () => {
          bottomSheetRef.current?.dismiss()
        }
      }}
    >
      <BottomSheetModalProvider>
        {children}
        <BottomSheetModal
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          handleStyle={styles.handle}
          backdropComponent={(props) => (
            <BottomSheetBackdrop
              {...props}
              appearsOnIndex={1}
              animatedIndex={{ value: 1 }}
            />
          )}
        >
          {section === "date" && (
            <EventFormToolbarSection title="Start and End Dates">
              <EventFormDatePicker />
            </EventFormToolbarSection>
          )}
          {section === "color" && (
            <EventFormToolbarSection title="Colors">
              <EventFormColorPicker />
            </EventFormToolbarSection>
          )}
          {section === "advanced" && (
            <EventFormToolbarSection title="Advanced Settings">
              <EventFormAdvancedSettings />
            </EventFormToolbarSection>
          )}
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </ToolbarContext.Provider>
  )
}

const useSnapPoints = () => {
  const fontScale = useFontScale()
  return useMemo(
    () => (fontScale > DynamicTypeSizes.xxxLarge ? ["60%"] : ["35%"]),
    [fontScale]
  )
}

const ToolbarContext = createContext<ToolbarContextValues | undefined>(
  undefined
)

const styles = StyleSheet.create({
  handle: {
    opacity: 0
  }
})
