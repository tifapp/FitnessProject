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
import { _ToolbarSectionView } from "./SectionView"

export type _ToolbarSection = "date" | "color" | "advanced"

export type _ToolbarContextValues = {
  openSection: (section: _ToolbarSection) => void
  dismissCurrentSection: () => void
}

// NB: Programmer error if this is ever undefined.
export const _useToolbar = () => useContext(ToolbarContext)!!

export type _ToolbarProviderProps = {
  children: ReactNode
}

export const _ToolbarProvider = ({ children }: _ToolbarProviderProps) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const [section, setSection] = useState<_ToolbarSection | undefined>()

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
            <_ToolbarSectionView title="Start and End Dates">
              <EventFormDatePicker />
            </_ToolbarSectionView>
          )}
          {section === "color" && (
            <_ToolbarSectionView title="Pick Color">
              <EventFormColorPicker />
            </_ToolbarSectionView>
          )}
          {section === "advanced" && (
            <_ToolbarSectionView title="Advanced">
              <EventFormAdvancedSettings />
            </_ToolbarSectionView>
          )}
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </ToolbarContext.Provider>
  )
}

const bottomSheetSnapPoints = ["50%"]

const ToolbarContext = createContext<_ToolbarContextValues | undefined>(
  undefined
)
