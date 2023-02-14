import addressFormatter from "@fragaria/address-formatter"

/**
 * A type representing the components of an address.
 */
export type AddressComponents = {
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
 * Formats an `AddressComponents` instance into a readable address.
 *
 * At the moment, this only supports US formatted addresses.
 */
export const formatAddressComponents = (components: AddressComponents) => {
  // TODO: - At some point this should probably support internationalized formats.
  const streetNumber = components.street
    ? components.streetNumber ?? undefined
    : undefined

  const postalCode = components.region
    ? components.postalCode ?? undefined
    : undefined
  return addressFormatter
    .format(
      {
        street: components.street ?? undefined,
        streetNumber,
        city: components.city ?? undefined,
        region: components.region ?? undefined,
        postcode: postalCode,
        state: components.region ?? undefined
      },
      { abbreviate: true, countryCode: "US" }
    )
    .split("\n")
    .filter((str) => str.length > 0)
    .join(", ")
}
