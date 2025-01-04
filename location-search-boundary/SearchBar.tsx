import React from "react"
import { useAtomValue, useSetAtom } from "jotai"
import { SearchBar } from "@components/SearchBar"
import { searchTextAtoms } from "./SearchTextAtoms"
import { TouchableIonicon } from "@components/common/Icons"
import { StyleProp, ViewStyle } from "react-native"
import { useFontScale } from "@lib/Fonts"

export type LocationSearchBarProps = {
  onBackTapped: () => void
  placeholder: string
  style?: StyleProp<ViewStyle>
}

/**
 * A search bar that edits the current location search query.
 */
export const LocationSearchBar = ({
  onBackTapped,
  placeholder,
  style
}: LocationSearchBarProps) => {
  const text = useAtomValue(searchTextAtoms.currentValueAtom)
  const setText = useSetAtom(searchTextAtoms.debouncedValueAtom)
  return (
    <SearchBar
      style={style}
      textStyle={{ height: 32 * useFontScale() }}
      placeholder={placeholder}
      leftAddon={
        <TouchableIonicon
          icon={{ name: "chevron-back-outline" }}
          onPress={onBackTapped}
          accessibilityLabel="Go back"
        />
      }
      text={text}
      onTextChanged={setText}
    />
  )
}
