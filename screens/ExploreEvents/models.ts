import { LocationCoordinate2D } from "@lib/location"

/**
 * Creates an {@link Region} from a coordinate suitable for the explore map.
 */
export const createDefaultMapRegion = (coordinates: LocationCoordinate2D) => ({
  ...coordinates,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1
})

/**
 * The default region if none can be retreived from location search or the user's location.
 */
export const SAN_FRANCISCO_DEFAULT_REGION = createDefaultMapRegion({
  latitude: 37.773972,
  longitude: -122.431297
})

/**
 * A type to describe the initial center of the explore events map.
 */
export type ExploreEventsInitialCenter =
  | { center: "user-location" }
  | { center: "preset"; coordinate: LocationCoordinate2D }

/**
 * Creates an {@link ExploreEventsInitialCenter} from a coordinate.
 *
 * The `"user-location"` variant is returned if `coordinate` is undefined.
 *
 * @param coordinate the coordinate to base the initial center on
 */
export const createInitialCenter = (
  coordinate?: LocationCoordinate2D
): ExploreEventsInitialCenter => {
  if (coordinate) return { center: "preset", coordinate }
  return { center: "user-location" }
}

/**
 * Attempts to convert an {@link ExploreEventsInitialCenter} to a region.
 */
export const initialCenterToRegion = (center: ExploreEventsInitialCenter) => {
  return center.center === "preset"
    ? createDefaultMapRegion(center.coordinate)
    : undefined
}
