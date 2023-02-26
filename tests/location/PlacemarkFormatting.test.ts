import { placemarkToFormattedAddress } from "@lib/location"
import { baseTestPlacemark, unknownLocationPlacemark } from "./helpers"

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

  it("returns undefined when little no info in placemark", () => {
    expect(
      placemarkToFormattedAddress(unknownLocationPlacemark)
    ).toBeUndefined()
  })
})
