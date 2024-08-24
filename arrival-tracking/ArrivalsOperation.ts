import { TiFAPIClient } from "TiFShared/api"
import { EventRegion } from "TiFShared/domain-models/Event"
import { EventArrivals } from "./Arrivals"

export type EventArrivalsOperationKind = "arrived" | "departed"

export type EventArrivalsOperationUnsubscribe = () => void

export type PerformArrivalsOperation = (
  region: EventRegion,
  kind: EventArrivalsOperationKind
) => Promise<EventArrivals>

/**
 * Marks the events at the given region as either "arrived" or "departed".
 */
export const performEventArrivalsOperation = async (
  region: EventRegion,
  kind: EventArrivalsOperationKind,
  tifAPI: TiFAPIClient
) => {
  const methodKey = kind === "arrived" ? "arriveAtRegion" : "departFromRegion"
  return await tifAPI.arriveAtRegion({ body: region }).then((result) => {
    type r = typeof result
    return EventArrivals.fromRegions(result.data.trackableRegions)
  })
}
