import { LocationCoordinate2D } from "TiFShared/domain-models/LocationCoordinate2D"
import { createDefaultMapRegion } from "./Region"

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
