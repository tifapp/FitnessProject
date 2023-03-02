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
import { EventFormAdvancedSettings } from ".."
import { EventFormColorPicker } from "../ColorPicker"
import { EventFormDatePicker } from "../DatePicker"
import { ToolbarSectionView } from "./SectionView"

export type ToolbarSection = "date" | "color" | "advanced"

export type ToolbarContextValues = {
  openSection: (section: ToolbarSection) => void
  dismissCurrentSection: () => void
}

// NB: Programmer error if this is ever undefined.
export const useToolbar = () => useContext(ToolbarContext)!!

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
            <ToolbarSectionView title="Start and End Dates">
              <EventFormDatePicker />
            </ToolbarSectionView>
          )}
          {section === "color" && (
            <ToolbarSectionView title="Pick Color">
              <EventFormColorPicker />
            </ToolbarSectionView>
          )}
          {section === "advanced" && (
            <ToolbarSectionView title="Advanced">
              <EventFormAdvancedSettings />
            </ToolbarSectionView>
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
