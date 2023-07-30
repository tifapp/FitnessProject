import { showLocation } from "react-native-map-link"
import {
  LocationCoordinate2D,
  Placemark,
  placemarkToFormattedAddress
} from "./location"

export type OpenInMapsOptions = {
  coordinates: LocationCoordinate2D
  placemark?: Placemark
}

const makeShowLocationOptions = (options: OpenInMapsOptions) => ({
  latitude: options.coordinates.latitude,
  longitude: options.coordinates.longitude,
  title: options.placemark
    ? placemarkToFormattedAddress(options.placemark)
    : undefined
})

/**
 * Opens the user's preffered maps app given a list of options.
 */
export const openInMaps = (options: OpenInMapsOptions) => {
  showLocation(makeShowLocationOptions(options))
}

/**
 * Opens the user's preferred maps app with directions to the given `coordinates` inside `options`.
 */
export const openInMapWithDirections = async (options: OpenInMapsOptions) => {
  showLocation({
    ...makeShowLocationOptions(options),
    directionsMode: "car" // TODO: - Should this be customizeable in settings?
  })
}
