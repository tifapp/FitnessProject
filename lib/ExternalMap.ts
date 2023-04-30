import { showLocation } from "react-native-map-link"
import * as Location from "expo-location"
import {
  LocationCoordinate2D,
  Placemark,
  UserLocationTrackingUpdate,
  placemarkToFormattedAddress
} from "./location"


export type EventMapDetails = {
  coordinates: LocationCoordinate2D,
  placemark?: Placemark
}

const externalMapOptions = (details: EventMapDetails) => {
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

export const openExternalMap = (details: EventMapDetails) => {
  showLocation(externalMapOptions(details))
}

export const externalMapWithDirections = 
  async (userLocation: UserLocationTrackingUpdate | undefined, details: EventMapDetails) => {
  const options = externalMapOptions(details)
  const userCoordinates =
    userLocation && userLocation.status === "success"
      ? userLocation.location.coordinates
      : undefined

  if (!userCoordinates) {
    await Location.requestForegroundPermissionsAsync()
  }

  if (userCoordinates) {
    showLocation({
      ...options,
      sourceLatitude: userCoordinates.latitude,
      sourceLongitude: userCoordinates.longitude,
      directionsMode: "car"
    })
  } else {
    openExternalMap(details)
  }
}