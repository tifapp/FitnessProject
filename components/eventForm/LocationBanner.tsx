import { useReverseGeocodeQuery } from "../../hooks/Geocoding"
import { placemarkToFormattedAddress } from "../../lib/location"
import React from "react"
import { StyleSheet, View } from "react-native"
import { useEventFormContext } from "./EventForm"
import { FormLabel, SkeletonFormLabel } from "../formComponents/FormLabels"
import { MaterialIcons } from "@expo/vector-icons"
import { FontScaleFactors, useFontScale } from "../../lib/FontScale"
import { EventFormLocationInfo } from "./EventFormValues"

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
          <GeocodedLocationInfoBanner {...locationInfo} />
        )}
      <MaterialIcons
        name="chevron-right"
        size={
          24 * useFontScale({ maximumScaleFactor: FontScaleFactors.xxxLarge })
        }
        color="black"
        style={styles.bannerNavigationIcon}
      />
    </View>
  )
}

const GeocodedLocationInfoBanner = (locationInfo: EventFormLocationInfo) => {
  const { status, placemarkInfo } = usePlacemarkInfo(locationInfo)

  if (status === "error") {
    // TODO: - Should this just be the message of the error?
    return (
      <FormLabel
        style={styles.label}
        icon="location-on"
        headerText="Unable to find location, please try again later."
      />
    )
  }

  // TODO: - Add shimming loading effect
  if (!placemarkInfo) {
    return <SkeletonFormLabel icon="location-on" />
  }

  return (
    <FormLabel
      style={styles.label}
      icon="location-on"
      headerText={placemarkInfo.name ?? "Unknown Location"}
      captionText={placemarkInfo.address ?? "Unknown Address"}
    />
  )
}

const usePlacemarkInfo = (locationInfo: EventFormLocationInfo) => {
  const { data: placemark, status } = useReverseGeocodeQuery(
    locationInfo.coordinates,
    { enabled: !locationInfo.placemarkInfo }
  )

  const geocodedPlacemarkInfo = placemark
    ? {
      name: placemark.name ?? undefined,
      address: placemarkToFormattedAddress(placemark)
    }
    : undefined

  return {
    status,
    placemarkInfo: geocodedPlacemarkInfo ?? locationInfo.placemarkInfo
  }
}

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
