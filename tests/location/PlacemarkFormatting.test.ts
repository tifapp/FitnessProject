import { Placemark, placemarkToFormattedAddress } from "@lib/location"

describe("Placemark Formatting tests", () => {
  it("formats in US style", () => {
    const components: Placemark = {
      name: "Apple Infinite Loop",
      country: "United States of America",
      postalCode: "95104",
      street: "Cupertino Rd",
      streetNumber: "1234",
      region: "CA",
      isoCountryCode: "US",
      city: "Cupertino"
    }
    expect(placemarkToFormattedAddress(components)).toEqual(
      "1234 Cupertino Rd, Cupertino, CA 95104"
    )
  })

  it("omits street number when missing street name", () => {
    const components: Placemark = {
      name: "Apple Infinite Loop",
      country: "United States of America",
      postalCode: "95104",
      street: null,
      streetNumber: "1234",
      region: "CA",
      isoCountryCode: "US",
      city: "Cupertino"
    }
    expect(placemarkToFormattedAddress(components)).toEqual(
      "Cupertino, CA 95104"
    )
  })

  it("omits postal code when missing state", () => {
    const components: Placemark = {
      name: "Apple Infinite Loop",
      country: "United States of America",
      postalCode: "95104",
      street: "Cupertino Rd",
      streetNumber: "1234",
      region: null,
      isoCountryCode: "US",
      city: "Cupertino"
    }
    expect(placemarkToFormattedAddress(components)).toEqual(
      "1234 Cupertino Rd, Cupertino"
    )
  })

  it("returns undefined when no street, city, or region", () => {
    const components: Placemark = {
      name: "North Pacific Ocean",
      country: null,
      postalCode: null,
      street: null,
      streetNumber: null,
      region: null,
      isoCountryCode: null,
      city: null
    }
    expect(placemarkToFormattedAddress(components)).toBeUndefined()
  })
})
