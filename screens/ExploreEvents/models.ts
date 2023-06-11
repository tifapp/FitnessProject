import { LocationCoordinate2D } from "@lib/location"

export const createDefaultMapRegion = (coordinates: LocationCoordinate2D) => ({
  ...coordinates,
  latitudeDelta: 0.3,
  longitudeDelta: 0.3
})

export const SAN_FRANCISCO_DEFAULT_REGION = createDefaultMapRegion({
  latitude: 37.773972,
  longitude: -122.431297
})

export type ExploreEventsInitialCenter =
  | { type: "user-location" }
  | { type: "preset"; coordinates: LocationCoordinate2D }

export const initialCenterToRegion = (center: ExploreEventsInitialCenter) => {
  return center.type === "preset"
    ? createDefaultMapRegion(center.coordinates)
    : undefined
}
