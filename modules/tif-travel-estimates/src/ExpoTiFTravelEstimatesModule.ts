import { requireOptionalNativeModule } from "@lib/utils/RequireOptionalNativeModule"
import { LocationCoordinate2D } from "@shared-models/Location"
import { EventTravelEstimates } from "@shared-models/TravelEstimates"

/**
 * Native code methods for travel estimates.
 */
export interface ExpoTiFTravelEstimatesModule {
  /**
   * Computes {@link EventTravelEstimates} for the given source and destination
   * coordinates.
   */
  travelEstimatesAsync(
    source: LocationCoordinate2D,
    destination: LocationCoordinate2D
  ): Promise<EventTravelEstimates>

  /**
   * Cancels an in progress estimation for the given source and destination
   * coordinates.
   *
   * This will cause the equivalent `travelEstimatesAsync` call to to reject.
   */
  cancelTravelEstimatesAsync(
    source: LocationCoordinate2D,
    destination: LocationCoordinate2D
  ): Promise<void>
}

export const ExpoTiFTravelEstimates =
  requireOptionalNativeModule<ExpoTiFTravelEstimatesModule>(
    "ExpoTiFTravelEstimates"
  )
