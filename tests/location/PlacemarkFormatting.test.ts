import { placemarkToFormattedAddress } from "@lib/location"
import { baseTestPlacemark } from "./helpers"

describe("Placemark Formatting tests", () => {
  it("formats in US style", () => {
    expect(placemarkToFormattedAddress(baseTestPlacemark)).toEqual(
      "1234 Cupertino Rd, Cupertino, CA 95104"
    )
  })

  it("omits street number when missing street name", () => {
    expect(
      placemarkToFormattedAddress({ ...baseTestPlacemark, street: null })
    ).toEqual("Cupertino, CA 95104")
  })

  it("omits postal code when missing state", () => {
    expect(
      placemarkToFormattedAddress({ ...baseTestPlacemark, region: null })
    ).toEqual("1234 Cupertino Rd, Cupertino")
  })

  it("returns undefined when no street, city, or region", () => {
    const placemark = {
      name: "North Pacific Ocean",
      country: null,
      postalCode: null,
      street: null,
      streetNumber: null,
      region: null,
      isoCountryCode: null,
      city: null
    }
    expect(placemarkToFormattedAddress(placemark)).toBeUndefined()
  })
})
