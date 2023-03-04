import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetBackdrop
} from "@gorhom/bottom-sheet"
import React, {
  createContext,
  ReactNode,
  useContext,
  useRef,
  useState
} from "react"
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

  return (
    <ToolbarContext.Provider
      value={{
        openSection: (section) => {
          setSection(section)
          bottomSheetRef.current?.present()
        },
        dismissCurrentSection: () => {
          setSection(undefined)
          bottomSheetRef.current?.dismiss()
        }
      }}
    >
      <BottomSheetModalProvider>
        {children}
        <BottomSheetModal
          ref={bottomSheetRef}
          index={0}
          snapPoints={bottomSheetSnapPoints}
          backdropComponent={BottomSheetBackdrop}
        >
          {section === "date" && (
            <EventFormToolbarSection title="Start and End Dates">
              <EventFormDatePicker />
            </EventFormToolbarSection>
          )}
          {section === "color" && (
            <EventFormToolbarSection title="Pick Color">
              <EventFormColorPicker />
            </EventFormToolbarSection>
          )}
          {section === "advanced" && (
            <EventFormToolbarSection title="Advanced">
              <EventFormAdvancedSettings />
            </EventFormToolbarSection>
          )}
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </ToolbarContext.Provider>
  )
}

const bottomSheetSnapPoints = ["50%"]

const ToolbarContext = createContext<ToolbarContextValues | undefined>(
  undefined
)
