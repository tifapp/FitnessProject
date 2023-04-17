import React from "react"
import { Headline } from "@components/Text"
import { useReverseGeocodeQuery } from "@hooks/Geocoding"
import { LocationCoordinate2D, Location } from "@lib/location"
import { TouchableHighlight } from "react-native"

export type LocationSearchUserLocationOptionProps = {
  onSelected: (selection: Location) => void
  coordinates: LocationCoordinate2D
}

/**
 * Displays a selectable option that represents the user's current
 * location in the location search ui.
 *
 * When this is selected, the user's location is reverse geocoded which may
 * introduce a slight delay.
 */
export const LocationSearchUserLocationOptionView = ({
  onSelected,
  coordinates
}: LocationSearchUserLocationOptionProps) => {
  const { refetch } = useReverseGeocodeQuery(coordinates, { isEnabled: false })

  const optionTapped = async () => {
    const reverseGeocodedLocation = await refetch()
    if (reverseGeocodedLocation.status !== "success") {
      onSelected({ coordinates, placemark: {} })
    } else {
      onSelected(reverseGeocodedLocation.data)
    }
  }

  return (
    <TouchableHighlight onPress={() => optionTapped()}>
      <Headline>Use current location</Headline>
    </TouchableHighlight>
  )
}
