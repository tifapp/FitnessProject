import { TiFAPI } from "TiFShared/api"
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
  tifAPI: TiFAPI
) => {
  const methodKey = kind === "arrived" ? "arriveAtRegion" : "departFromRegion"
  return await tifAPI[methodKey]({ body: region }).then((result) =>
    EventArrivals.fromRegions(result.data.trackableRegions)
  )
}
