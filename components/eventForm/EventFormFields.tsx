import { useReverseGeocodeQuery } from "@hooks/Geocoding"
import { placemarkToFormattedAddress } from "@lib/location"
import React from "react"
import { Text, TextInput, View } from "react-native"
import {
  useEventFormField,
  useEventFormValue,
  EventFormLocationInfo,
  EventFormPlacemarkInfo
} from "./EventForm"

/**
 * The title field for an event form.
 */
export const EventFormTitleField = () => {
  const [title, setTitle] = useEventFormField("title")
  return <TextInput placeholder="Title" value={title} onChangeText={setTitle} />
}

/**
 * Displays the selected location (if one) in the event form.
 */
export const EventFormLocationField = () => {
  const locationInfo = useEventFormValue("locationInfo")
  if (!locationInfo) return <></>
  return <LocationInfoLabel {...locationInfo} />
}

const LocationInfoLabel = (locationInfo: EventFormLocationInfo) => {
  return locationInfo.placemarkInfo
    ? (
      <PlacemarkInfoLabel {...locationInfo.placemarkInfo} />
    )
    : (
      <GeocodedLocationInfoLabel {...locationInfo} />
    )
}

const GeocodedLocationInfoLabel = (locationInfo: EventFormLocationInfo) => {
  const { data: placemark, status } = useReverseGeocodeQuery(
    locationInfo.coordinates
  )

  if (status === "error") {
    return (
      <Text>Unable to find address of location, please try again later.</Text>
    )
  }

  // TODO: - Add shimming loading effect
  if (!placemark) return <></>

  const address = placemarkToFormattedAddress(placemark)
  return (
    <PlacemarkInfoLabel name={placemark.name ?? undefined} address={address} />
  )
}

const PlacemarkInfoLabel = ({ name, address }: EventFormPlacemarkInfo) => (
  <View>
    {name && <Text>{name}</Text>}
    <Text>{address ?? "Unknown Address"}</Text>
  </View>
)
