import { AmplifyLocationSearchUtils } from "@lib/location/search/AmplifyUtils"
import { Coordinates } from "@aws-amplify/geo"

const testGeometry = { point: [-121, 43] as Coordinates }

describe("AmplifyLocationSearchUtils tests", () => {
  test("placeToSearchResult uses the first address component as the place name", () => {
    expect(
      AmplifyLocationSearchUtils.placeToSearchResult({
        geometry: testGeometry,
        label: "McDonalds Play Place, Riverside Park, 1201, South Africa"
      })
    ).toMatchObject(expect.objectContaining({ name: "McDonalds Play Place" }))
  })

  test("placeToSearchResult excludes name in formatted address", () => {
    expect(
      AmplifyLocationSearchUtils.placeToSearchResult({
        geometry: testGeometry,
        label: "McDonalds Play Place, Riverside Park, 1201, South Africa"
      })
    ).toMatchObject(
      expect.objectContaining({
        formattedAddress: "Riverside Park, 1201, South Africa"
      })
    )
  })

  test("placeToSearchResult makes formatted address \"Country\" when label is a country name", () => {
    expect(
      AmplifyLocationSearchUtils.placeToSearchResult({
        geometry: testGeometry,
        label: "United States"
      })
    ).toMatchObject(
      expect.objectContaining({
        name: "United States",
        formattedAddress: "Country"
      })
    )
  })

  test("placeToSearchResult returns undefined when no geometry", () => {
    expect(
      AmplifyLocationSearchUtils.placeToSearchResult({
        geometry: undefined,
        label: "United States"
      })
    ).toBeUndefined()
  })

  test("placeToSearchResult maps geometry to location coordinates", () => {
    expect(
      AmplifyLocationSearchUtils.placeToSearchResult({
        geometry: { point: [-121.1234, 41.1234] },
        label: "United States"
      })
    ).toMatchObject(
      expect.objectContaining({
        coordinates: { latitude: 41.1234, longitude: -121.1234 }
      })
    )
  })

  test("placeToSearchResult handles undefined label", () => {
    expect(
      AmplifyLocationSearchUtils.placeToSearchResult({
        geometry: { point: [-121.1234, 41.1234] },
        label: undefined
      })
    ).toMatchObject({
      coordinates: { latitude: 41.1234, longitude: -121.1234 },
      name: undefined,
      formattedAddress: undefined
    })
  })
})
