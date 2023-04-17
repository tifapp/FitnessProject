import React from "react"
import { useAtom } from "jotai"
import { TouchableOpacity, View } from "react-native"
import { SearchBar } from "@components/SearchBar"
import { searchTextAtom } from "./state"

export type LocationSearchBarProps = {
  onBackTapped: () => void
  placeholder: string
}

/**
 * A search bar that edits the current location search query.
 */
export const LocationSearchBar = ({
  onBackTapped,
  placeholder
}: LocationSearchBarProps) => {
  const [searchText, setSearchText] = useAtom(searchTextAtom)
  return (
    <SearchBar
      placeholder={placeholder}
      leftAddon={
        <TouchableOpacity onPress={onBackTapped} accessibilityLabel="Go back">
          <View />
        </TouchableOpacity>
      }
      text={searchText}
      onTextChanged={setSearchText}
    />
  )
}
