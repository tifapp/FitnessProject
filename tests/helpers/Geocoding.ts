import { LocationCoordinate2D, Placemark } from "@lib/location"

export const unimplementedGeocoding = () => ({
  geocode: jest.fn(),
  reverseGeocode: jest.fn()
})

export type UnimplementedGeocoding = ReturnType<typeof unimplementedGeocoding>

/**
 * Mocks returned placemarks for a `geocoding.reverseGeocode` call.
 */
export const mockReverseGeocodedPlacemarks = (
  location: LocationCoordinate2D,
  placemarks: Placemark[],
  geocoding: UnimplementedGeocoding
) => {
  const reverseGeocode = geocoding.reverseGeocode.bind({})
  geocoding.reverseGeocode.mockImplementation(
    async (inLocation: LocationCoordinate2D) => {
      if (
        location.latitude === inLocation.latitude &&
        location.longitude === inLocation.longitude
      ) {
        return placemarks
      }
      return await reverseGeocode(inLocation)
    }
  )
}
