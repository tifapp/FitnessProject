import React from "react"
import { LocationCoordinate2D, Location } from "@lib/location"
import { TouchableHighlight } from "react-native"
import { useReverseGeocodeQuery } from "@hooks/Geocoding"
import { Headline } from "@components/Text"

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
