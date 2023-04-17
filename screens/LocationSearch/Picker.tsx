import React, { ReactNode } from "react"
import { Location } from "@lib/location"
import { useUserCoordinatesQuery } from "@hooks/UserLocation"
import {
  LocationSearchOptionsListProps,
  LocationSearchOptionsListView
} from "./OptionsList"
import {
  LocationSearchUserLocationOptionProps,
  LocationSearchUserLocationOptionView
} from "./UserLocationOptionView"

export type LocationSearchPickerProps = {
  renderUserLocationOption?: (
    props: LocationSearchUserLocationOptionProps
  ) => ReactNode
  renderOptionsList?: (props: LocationSearchOptionsListProps) => ReactNode
  onLocationSelected: (selection: Location) => void
}

/**
 * Renders the location search UI involved with picking a location from
 * a list of options.
 */
export const LocationSearchPicker = ({
  renderUserLocationOption = LocationSearchUserLocationOptionView,
  renderOptionsList = LocationSearchOptionsListView,
  onLocationSelected
}: LocationSearchPickerProps) => {
  const { data } = useUserCoordinatesQuery("precise")
  if (!data) return null
  return (
    <>
      {renderUserLocationOption({
        coordinates: data.coordinates,
        onSelected: onLocationSelected
      })}
    </>
  )
}
