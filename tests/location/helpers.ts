export const baseTestPlacemark = {
  name: "Apple Infinite Loop",
  country: "United States of America",
  postalCode: "95104",
  street: "Cupertino Rd",
  streetNumber: "1234",
  region: "CA",
  isoCountryCode: "US",
  city: "Cupertino"
} as const

export const unknownLocationPlacemark = {
  name: "North Pacific Ocean",
  country: null,
  postalCode: null,
  street: null,
  streetNumber: null,
  region: null,
  isoCountryCode: null,
  city: null
} as const
