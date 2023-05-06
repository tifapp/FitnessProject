import { showLocation } from "react-native-map-link"
import {
  LocationCoordinate2D,
  Placemark,
  UserLocationTrackingUpdate,
  placemarkToFormattedAddress,
  requestLocationPermissions
} from "./location"

export type NativeEventMapDetails = {
  coordinates: LocationCoordinate2D
  placemark?: Placemark
}

const nativeMapOptions = (details: NativeEventMapDetails) => {
  const name =
    details.placemark && details.placemark.street
      ? placemarkToFormattedAddress(details.placemark)
      : ""

  return {
    latitude: details.coordinates.latitude,
    longitude: details.coordinates.longitude,
    title: name
  }
}

export const openInMaps = (details: NativeEventMapDetails) => {
  showLocation(nativeMapOptions(details))
}

export const openMapDirections = async (
  userLocation: UserLocationTrackingUpdate | undefined,
  details: NativeEventMapDetails
) => {
  const options = nativeMapOptions(details)
  let userCoordinates =
    userLocation && userLocation.status === "success"
      ? userLocation.location.coordinates
      : undefined

  if (!userCoordinates) {
    await requestLocationPermissions()
    userCoordinates =
      userLocation && userLocation.status === "success"
        ? userLocation.location.coordinates
        : undefined
  }

  if (userCoordinates) {
    showLocation({
      ...options,
      sourceLatitude: userCoordinates.latitude,
      sourceLongitude: userCoordinates.longitude,
      directionsMode: "car"
    })
  } else {
    openInMaps(details)
  }
}
