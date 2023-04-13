import addressFormatter from "@fragaria/address-formatter"
import { z } from "zod"

/**
 * A zod schema for {@link Placemark}.
 */
export const PlacemarkSchema = z.object({
  name: z.string(),
  country: z.string(),
  postalCode: z.string(),
  street: z.string(),
  streetNumber: z.string(),
  region: z.string(),
  isoCountryCode: z.string(),
  city: z.string()
}).partial()

/**
 * A type representing the components of an address.
 */
export type Placemark = Readonly<z.infer<typeof PlacemarkSchema>>

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

const US_COUNTRY_CODE = "US"
