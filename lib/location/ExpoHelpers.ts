import { LocationObject, LocationObjectCoords } from "expo-location"
import { LocationCoordinate2D, mockLocationCoordinate2D } from "./Location"
import { randomFloatInRange, randomlyNull } from "@lib/Random"

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
