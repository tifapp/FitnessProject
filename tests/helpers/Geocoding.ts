import { unimplementedMock } from "./unimplemented"

/**
 * Geocoding operations which cause test failures when invoked.
 */
export const unimplementedGeocoding = {
  geocode: unimplementedMock("geocode"),
  reverseGeocode: unimplementedMock("reverseGeocode")
}
