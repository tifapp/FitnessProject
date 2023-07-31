import { showLocation } from "react-native-map-link"
import {
  LocationCoordinate2D,
  Placemark,
  placemarkToFormattedAddress
} from "./location"

/**
 * A request type that allows for opening certain locations in the user's preferred maps app.
 */
export type OpenInMapsRequest = {
  /**
   * The coordinates of the location to open in maps.
   */
  coordinates: LocationCoordinate2D

  /**
   * An optional placemark to give for identifying the location to be opened. This helps maps apps
   * give other additional info about the location (eg. Yelp reviews, etc.)
   */
  placemark?: Placemark
}

/**
 * Opens the user's preffered maps app given a list of options.
 */
export const openInMaps = (options: OpenInMapsRequest) => {
  showLocation(makeShowLocationOptions(options))
}

/**
 * Opens the user's preferred maps app with directions to the given `coordinates` inside `options`.
 */
export const openInMapWithDirections = (options: OpenInMapsRequest) => {
  showLocation({
    ...makeShowLocationOptions(options),
    directionsMode: "car" // TODO: - Should this be customizeable in settings?
  })
}

const makeShowLocationOptions = (options: OpenInMapsRequest) => ({
  latitude: options.coordinates.latitude,
  longitude: options.coordinates.longitude,
  title: options.placemark
    ? placemarkToFormattedAddress(options.placemark)
    : undefined
})
