import addressFormatter from "@fragaria/address-formatter"
import { Placemark } from "TiFShared/domain-models/Placemark"

/**
 * Formats a `Placemark` instance into a readable address if able.
 *
 * At the moment, this only outputs US style addresses.
 */
export const placemarkToFormattedAddress = (placemark: Placemark) => {
  // TODO: - At some point this should probably support internationalized styles.
  const streetNumber = placemark.street ? placemark.streetNumber : undefined

  const postalCode = placemark.region ? placemark.postalCode : undefined
  const formattedAddress = addressFormatter
    .format(
      {
        street: placemark.street,
        streetNumber,
        city: placemark.city,
        region: placemark.region,
        postcode: postalCode,
        state: placemark.region
      },
      { abbreviate: true, countryCode: US_COUNTRY_CODE }
    )
    .split("\n")
    .filter((str) => str.length > 0)
    .join(", ")
  return formattedAddress === US_COUNTRY_CODE ? undefined : formattedAddress
}

/**
 * Formats a `Placemark` instance into a short address (name, city, region/state)
 *
 * At the moment, this only outputs US style addresses.
 */
export const placemarkToAbbreviatedAddress = (placemark: Placemark) => {
  if (placemark.city === undefined || placemark.region === undefined) {
    return "Unknown Location"
  } else if (placemark.name === undefined) {
    return `${placemark.city}, ${placemark.region}`
  }
  return `${placemark.name}, ${placemark.city}, ${placemark.region}`
}

const US_COUNTRY_CODE = "US"
