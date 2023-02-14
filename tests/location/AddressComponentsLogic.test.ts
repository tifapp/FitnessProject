import { AddressComponents, formatAddressComponents } from "@lib/location"

describe("AddressComponents Logic tests", () => {
  test("formatAddressComponents formats components in US style", () => {
    const components: AddressComponents = {
      name: "Apple Infinite Loop",
      country: "United States of America",
      postalCode: "95104",
      street: "Cupertino Rd",
      streetNumber: "1234",
      region: "CA",
      isoCountryCode: "US",
      city: "Cupertino"
    }
    expect(formatAddressComponents(components)).toEqual(
      "1234 Cupertino Rd, Cupertino, CA 95104"
    )
  })

  test("formatAddressComponents omits street number when missing street name", () => {
    const components: AddressComponents = {
      name: "Apple Infinite Loop",
      country: "United States of America",
      postalCode: "95104",
      street: null,
      streetNumber: "1234",
      region: "CA",
      isoCountryCode: "US",
      city: "Cupertino"
    }
    expect(formatAddressComponents(components)).toEqual("Cupertino, CA 95104")
  })

  test("formatAddressComponents omits postal code when missing state", () => {
    const components: AddressComponents = {
      name: "Apple Infinite Loop",
      country: "United States of America",
      postalCode: "95104",
      street: "Cupertino Rd",
      streetNumber: "1234",
      region: null,
      isoCountryCode: "US",
      city: "Cupertino"
    }
    expect(formatAddressComponents(components)).toEqual(
      "1234 Cupertino Rd, Cupertino"
    )
  })
})
