import { useReverseGeocode } from "@hooks/Geocoding"
import { formatLocation, Location } from "@lib/location"
import React from "react"
import { Text, View } from "react-native"
import { useEventFormValue } from "./EventForm"

/**
 * Displays the selected location (if one) in the event form.
 */
export const EventFormLocationField = () => {
  const location = useEventFormValue("location")
  if (!location) return <></>
  return <LocationLabel location={location} />
}

type LocationLabelProps = {
  location: Location
}

const LocationLabel = ({ location }: LocationLabelProps) => {
  const { data, status } = useReverseGeocode(location)
  if (status === "loading") {
    return <Text>{formatLocation(location)}</Text>
  }

  if (status !== "success" || !data.name) {
    return (
      <View>
        <Text>{formatLocation(location)}</Text>
        <Text>Unable to find address of location, please try again later.</Text>
      </View>
    )
  }

  return <Text>{data.name}</Text>
}
