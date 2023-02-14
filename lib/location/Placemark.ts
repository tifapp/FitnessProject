import addressFormatter from "@fragaria/address-formatter"

/**
 * A type representing the components of an address.
 */
export type Placemark = {
  readonly name: string | null
  readonly country: string | null
  readonly postalCode: string | null
  readonly street: string | null
  readonly streetNumber: string | null
  readonly region: string | null
  readonly isoCountryCode: string | null
  readonly city: string | null
}

/**
 * Formats a `Placemark` instance into a readable address if able.
 *
 * At the moment, this only outputs US style addresses.
 */
export const placeMarkToFormattedAddress = (placemark: Placemark) => {
  // TODO: - At some point this should probably support internationalized styles.
  const streetNumber = placemark.street
    ? placemark.streetNumber ?? undefined
    : undefined

  const postalCode = placemark.region
    ? placemark.postalCode ?? undefined
    : undefined
  const formattedAddress = addressFormatter
    .format(
      {
        street: placemark.street ?? undefined,
        streetNumber,
        city: placemark.city ?? undefined,
        region: placemark.region ?? undefined,
        postcode: postalCode,
        state: placemark.region ?? undefined
      },
      { abbreviate: true, countryCode }
    )
    .split("\n")
    .filter((str) => str.length > 0)
    .join(", ")
  return formattedAddress === countryCode ? undefined : formattedAddress
}

const countryCode = "US"
