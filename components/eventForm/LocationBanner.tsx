import { useReverseGeocodeQuery } from "../../location/Geocoding"
import { placemarkToFormattedAddress } from "../../location"
import React from "react"
import { StyleSheet, View } from "react-native"
import { useEventFormContext } from "./EventForm"
import { FormLabel, SkeletonFormLabel } from "../formComponents/FormLabels"
import { FontScaleFactors } from "../../lib/Fonts"
import {
  EventFormLocationInfo,
  EventFormPlacemarkInfo
} from "./EventFormValues"
import { MaterialIcon } from "@components/common/Icons"

/**
 * Displays the selected location (if one) in the event form.
 */
export const EventFormLocationBanner = () => {
  const locationInfo = useEventFormContext().watch("locationInfo")
  return (
    <View style={styles.bannerContainer}>
      {!locationInfo
        ? (
          <FormLabel
            style={styles.label}
            icon="location-pin"
            headerText="No Location Selected"
            captionText="You must select a location to save this event."
          />
        )
        : (
          <LocationInfoBanner {...locationInfo} />
        )}
      <MaterialIcon
        name="chevron-right"
        maximumFontScaleFactor={FontScaleFactors.xxxLarge}
        color="black"
        style={styles.bannerNavigationIcon}
      />
    </View>
  )
}

const LocationInfoBanner = (locationInfo: EventFormLocationInfo) => {
  return locationInfo.placemarkInfo
    ? (
      <PlacemarkInfoBanner {...locationInfo.placemarkInfo} />
    )
    : (
      <GeocodedLocationInfoBanner {...locationInfo} />
    )
}

const GeocodedLocationInfoBanner = (locationInfo: EventFormLocationInfo) => {
  const { data, status } = useReverseGeocodeQuery(locationInfo.coordinates)

  if (status === "error") {
    // TODO: - Should this just be the message of the error?
    return (
      <FormLabel
        style={styles.label}
        icon="location-pin"
        headerText="Unable to find location, please try again later."
      />
    )
  }

  // TODO: - Add shimming loading effect
  if (!data?.placemark) return <SkeletonFormLabel icon="location-pin" />

  const address = placemarkToFormattedAddress(data.placemark)
  return <PlacemarkInfoBanner name={data.placemark.name} address={address} />
}

const PlacemarkInfoBanner = ({ name, address }: EventFormPlacemarkInfo) => (
  <FormLabel
    style={styles.label}
    icon="location-pin"
    headerText={name ?? "Unknown Location"}
    captionText={address ?? "Unknown Address"}
  />
)

const styles = StyleSheet.create({
  label: {
    maxWidth: "80%"
  },
  bannerContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  bannerNavigationIcon: {
    marginLeft: 8,
    opacity: 0.5
  }
})
