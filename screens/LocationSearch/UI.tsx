import React from "react"
import { LocationCoordinate2D, Location } from "@lib/location"
import {
  TouchableHighlight,
  TouchableOpacity,
  View
} from "react-native"
import { useReverseGeocodeQuery } from "@hooks/Geocoding"
import { Headline } from "@components/Text"
import { SearchBar } from "@components/SearchBar"
import { atom, useAtom } from "jotai"

const searchTextAtom = atom("")

export type HeaderLocationSearchBarProps = {
  onBackTapped: () => void
}

export const HeaderLocationSearchBar = ({
  onBackTapped
}: HeaderLocationSearchBarProps) => {
  const [searchText, setSearchText] = useAtom(searchTextAtom)
  return (
    <SearchBar
      leftAddon={
        <TouchableOpacity
          onPress={() => onBackTapped()}
          accessibilityLabel="Go back"
        >
          <View />
        </TouchableOpacity>
      }
      text={searchText}
      onTextChanged={setSearchText}
    />
  )
}

export type LocationSearchUserCoordinatesOptionProps = {
  onSelected: (selection: Location) => void
  coordinates: LocationCoordinate2D
}

export const LocationSearchUserCoordinatesOption = ({
  onSelected,
  coordinates
}: LocationSearchUserCoordinatesOptionProps) => {
  const { refetch } = useReverseGeocodeQuery(coordinates, { isEnabled: false })
  return (
    <TouchableHighlight
      onPress={async () => {
        const reverseGeocodedLocation = await refetch()
        if (reverseGeocodedLocation.status !== "success") {
          onSelected({ coordinates, placemark: {} })
        } else {
          onSelected(reverseGeocodedLocation.data)
        }
      }}
    >
      <Headline>Use current location</Headline>
    </TouchableHighlight>
  )
}
