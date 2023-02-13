/**
 * A type representing the components of an address.
 */
export type AddressPlacemark = {
  readonly name: string | null
  readonly country: string | null
  readonly postalCode: string | null
  readonly street: string | null
  readonly streetNumber: string | null
  readonly region: string | null
  readonly city: string | null
}
