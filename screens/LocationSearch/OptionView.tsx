import React from "react"
import { Location } from "@lib/location"
import {
  LocationSearchDependencyKeys,
  LocationSearchOption
} from "./OptionData"
import { Headline } from "@components/Text"
import { useDependencyValue } from "@lib/dependencies"
import { TouchableHighlight } from "react-native"

export type LocationSearchOptionProps = {
  option: LocationSearchOption
  distanceMiles?: number
  onSelected: (location: Location) => void
}

/**
 * Displays a {@link LocationSearchOption} with a specified distance.
 */
export const LocationSearchOptionView = ({
  option,
  distanceMiles,
  onSelected
}: LocationSearchOptionProps) => {
  const save = useDependencyValue(LocationSearchDependencyKeys.saveSelection)
  return (
    <TouchableHighlight
      onPress={() => {
        onSelected(option.location)
        save(option.location)
      }}
    >
      <Headline>{option.location.placemark.name}</Headline>
    </TouchableHighlight>
  )
}
