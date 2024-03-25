import { TiFAPI } from "@api-client/TiFAPI"
import { EventRegion } from "@shared-models/Event"
import { EventArrivalRegion } from "@shared-models/EventArrivals"

export type EventArrivalsOperationKind = "arrived" | "departed"

export type EventArrivalsOperationUnsubscribe = () => void

export type PerformArrivalsOperation = (
  region: EventRegion,
  kind: EventArrivalsOperationKind
) => Promise<EventArrivalRegion[]>

/**
 * Marks the events at the given region as either "arrived" or "departed".
 */
export const performEventArrivalsOperation = async (
  region: EventRegion,
  kind: EventArrivalsOperationKind,
  tifAPI: TiFAPI
) => {
  const methodKey = kind === "arrived" ? "arriveAtRegion" : "departFromRegion"
  return await tifAPI[methodKey](region).then(
    (result) => result.data.upcomingRegions
  )
}
