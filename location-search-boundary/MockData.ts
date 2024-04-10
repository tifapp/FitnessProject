import { randomBool } from "@lib/utils/Random"
import { RecentLocationAnnotation } from "@lib/RecentsLocations"
import { LocationSearchResult } from "./Models"
import { mockTiFLocation } from "@location/MockData"
import { LocationCoordinate2D } from "TiFShared/domain-models/LocationCoordinate2D"

/**
 * Creates a random {@link LocationSearchResultAnnotation}.
 */
export const mockLocationSearchAnnotation = () => {
  const annotation = randomBool() ? "attended-recently" : "hosted-recently"
  return annotation as RecentLocationAnnotation
}

/**
 * Mocks a {@link LocationSearchResult}.
 */
export const mockLocationSearchResult = (
  coordinates?: LocationCoordinate2D
) => {
  const isRecent = randomBool(0.8)
  return {
    location: mockTiFLocation(coordinates),
    annotation: isRecent ? mockLocationSearchAnnotation() : undefined,
    isRecentLocation: isRecent
  } as LocationSearchResult
}