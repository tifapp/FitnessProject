import { LocationCoordinate2D } from "@lib/location"

export const createDefaultMapRegion = (coordinates: LocationCoordinate2D) => ({
  ...coordinates,
  latitudeDelta: 0.3,
  longitudeDelta: 0.3
})
