import { LocationCoordinate2D } from "@lib/location"

export const createDefaultMapRegion = (coordinates: LocationCoordinate2D) => ({
  ...coordinates,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1
})

export const SAN_FRANCISCO_DEFAULT_REGION = createDefaultMapRegion({
  latitude: 37.773972,
  longitude: -122.431297
})

export type ExploreEventsInitialCenter =
  | { center: "user-location" }
  | { center: "preset"; coordinate: LocationCoordinate2D }

export const createInitialCenter = (
  coordinate?: LocationCoordinate2D
): ExploreEventsInitialCenter => {
  if (coordinate) return { center: "preset", coordinate }
  return { center: "user-location" }
}

export const initialCenterToRegion = (center: ExploreEventsInitialCenter) => {
  return center.center === "preset"
    ? createDefaultMapRegion(center.coordinate)
    : undefined
}
