import {
  LocationCoordinate2D,
  mockLocationCoordinate2D
} from "../../lib/location/Location"

/**
 * A wrapper function that calls on its provided function to calculate the ETA, and return the result.
 * At the moment, locations are mocked.
 *
 * @returns The ETA of two locations
 */
export const calculateETA = () => {
  const loc1 = mockLocationCoordinate2D()
  const loc2 = mockLocationCoordinate2D()
  return etaEvaluator(loc1, loc2, distanceCalculator)
}

/**
 * Function for determining distance between two points.
 * Mocked for now to return 59.
 *
 * @param loc1
 * @param loc2
 * @returns
 */
const distanceCalculator = (
  loc1: LocationCoordinate2D,
  loc2: LocationCoordinate2D
) => {
  const mockDistance = 59
  return mockDistance
}

/**
 * Function to create the final ETA, when given two locations and a function to evaluate those locations with.
 *
 * @param locationA
 * @param locationB
 * @param estimationFunction
 * @returns The total distance between those two locations, divided by the average speed of a car, 50 km/h.
 */
const etaEvaluator = (
  locationA: LocationCoordinate2D,
  locationB: LocationCoordinate2D,
  estimationFunction: (
    loc1: LocationCoordinate2D,
    loc2: LocationCoordinate2D
  ) => number
) => {
  const totalDistance = estimationFunction(locationA, locationB)
  const averageSpeed = 50
  return totalDistance / averageSpeed
}
