/**
 * Causes a test failure if called.
 *
 * @param tag a simple name to identify the unimplemented function that was called
 */
export const unimplemented = (tag: string) => {
  // eslint-disable-next-line no-undef
  return fail(`${tag} is unimplemented!`)
}

/**
 * Returns a jest mock that causes a test failure if the mock implementation is
 * not overriden and called during a test.
 *
 * This is best used when trying to mock an interface like for example, `Geocoding`:
 *
 * ```ts
 * const unimplementedGeocoding = {
 *   geocode: unimplementedMock("geocode"),
 *   reverseGeocode: unimplementedMock("reverseGeocode")
 * }
 * ```
 *
 * This ensures that any system under test does not use the `Geocoding` interface
 * in a malicious way, as you are now required to override each function depending
 * on the test.
 *
 * @param tag a simple name to identify the unimplemented function that was called
 */
export const unimplementedMock = (tag: string) => {
  return jest.fn().mockImplementation(() => unimplemented(tag))
}
