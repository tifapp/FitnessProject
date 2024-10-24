import { placemarkToFormattedAddress } from "@lib/AddressFormatting"
import { EventLocation } from "TiFShared/domain-models/Event"
import { showLocation } from "react-native-map-link"
import { setStringAsync } from "expo-clipboard"
import { LocationCoordinate2D } from "TiFShared/domain-models/LocationCoordinate2D"

/**
 * Basic fields that identifiy an {@link EventLocation} by name and coordinate
 * alone.
 */
export type EventLocationIdentifier = Pick<
  EventLocation,
  "coordinate" | "placemark"
>

/**
 * Copies an event location to the clipboard.
 *
 * If the event has no formattable placemark, the coordinates are formatted
 * and copied to the clipboard instead of the formatted address of the placemark.
 */
export const copyEventLocationToClipboard = (
  locationIdentifier: EventLocationIdentifier,
  setClipboardText: (text: string) => Promise<void> = expoCopyTextToClipboard
) => setClipboardText(formatEventLocation(locationIdentifier))

const expoCopyTextToClipboard = async (text: string) => {
  await setStringAsync(text)
}

const formatEventLocation = (locationIdentifier: EventLocationIdentifier) => {
  const formattedCoordinate = formatCoordinate(locationIdentifier.coordinate)
  if (!locationIdentifier.placemark) return formattedCoordinate
  const formattedPlacemark = placemarkToFormattedAddress(
    locationIdentifier.placemark
  )
  return formattedPlacemark ?? formattedCoordinate
}

const formatCoordinate = (coordinate: LocationCoordinate2D) => {
  return `${coordinate.latitude}, ${coordinate.longitude}`
}

/**
 * Opens the event location in the user's preffered maps app.
 *
 * @param location the location to open in maps.
 * @param directionsMode the mehtod of how to link specific directions to the location.
 */
export const openEventLocationInMaps = (
  location: EventLocationIdentifier,
  directionsMode?: "car" | "walk" | "bike" | "public-transport"
) => {
  showLocation({
    ...location.coordinate,
    title: location.placemark
      ? placemarkToFormattedAddress(location.placemark)
      : undefined,
    directionsMode
  })
}
