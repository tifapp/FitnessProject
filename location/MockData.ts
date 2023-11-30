import { LocationObject, LocationObjectCoords } from "expo-location"
import { LocationCoordinate2D, TiFLocation } from "./Location"
import { randomFloatInRange, randomlyNull } from "@lib/Random"
import { faker } from "@faker-js/faker"

/**
 * Creates a fake {@link LocationObject}.
 */
export const mockExpoLocationObject = (
  coordinates: LocationCoordinate2D = mockLocationCoordinate2D()
): LocationObject => ({
  coords: mockExpoLocationObjectCoords(coordinates),
  timestamp: new Date().getTime()
})

/**
 * Creates fake {@link LocationObjectCoords}.
 */
export const mockExpoLocationObjectCoords = (
  coordinates: LocationCoordinate2D = mockLocationCoordinate2D()
): LocationObjectCoords => ({
  ...coordinates,
  accuracy: randomlyNull(randomFloatInRange(15, 300), 0.1),
  altitude: randomlyNull(randomFloatInRange(10, 30), 0.1),
  altitudeAccuracy: randomlyNull(randomFloatInRange(1, 50), 0.1),
  heading: randomlyNull(randomFloatInRange(0, 180), 0.1),
  speed: randomlyNull(randomFloatInRange(5, 300), 0.1)
})

/**
 * Some mock Location coordinates suitable for testing.
 */
export namespace LocationCoordinatesMocks {
  export const SantaCruz = {
    latitude: 36.9741,
    longitude: -122.0308
  } as const

  export const NYC = {
    latitude: 40.7128,
    longitude: -74.006
  } as const

  export const SanFrancisco = {
    latitude: 37.7749,
    longitude: -122.4194
  } as const

  export const London = {
    latitude: 51.5072,
    longitude: 0.1276
  } as const

  export const Paris = {
    latitude: 48.8566,
    longitude: 2.3522
  } as const
}

/**
 * Generates a mock coordinate for testing and UI purposes.
 */
export const mockLocationCoordinate2D = (): LocationCoordinate2D => ({
  latitude: parseFloat(faker.address.latitude()),
  longitude: parseFloat(faker.address.longitude())
})

/**
 * Creates a mock location for testing and UI purposes.
 */
export const mockTiFLocation = (
  coordinates?: LocationCoordinate2D
): TiFLocation => ({
  coordinates: coordinates ?? mockLocationCoordinate2D(),
  placemark: mockPlacemark()
})

/**
 * Generates a mock placemark for testing and UI purposes.
 */
export const mockPlacemark = () => ({
  name: faker.address.street(),
  country: faker.address.country(),
  postalCode: faker.address.zipCode(),
  street: faker.address.street(),
  streetNumber: faker.address.buildingNumber(),
  region: faker.address.stateAbbr(),
  isoCountryCode: faker.address.countryCode(),
  city: faker.address.city()
})

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
  name: "North Pacific Ocean"
} as const

/**
 * Creates a mock {@link Region} suitable for testing purposes.
 */
export const mockRegion = () => ({
  ...mockLocationCoordinate2D(),
  latitudeDelta: randomFloatInRange(0.1, 2.3),
  longitudeDelta: randomFloatInRange(0.1, 2.3)
})
