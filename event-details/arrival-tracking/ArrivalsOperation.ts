import { TiFAPI } from "@api-client/TiFAPI"
import { EventArrivalOperationResult } from "@shared-models/EventArrivals"
import { LocationCoordinate2D } from "@shared-models/Location"

export type EventArrivalsOperationKind = "arrived" | "departed"

export type EventArrivalsOperationLocation = {
  coordinate: LocationCoordinate2D
  eventIds: number[]
}

export type PerformArrivalsOperation = (
  location: EventArrivalsOperationLocation,
  kind: EventArrivalsOperationKind
) => Promise<EventArrivalOperationResult[]>

/**
 * Marks the events at the given location as either "arrived" or "departed".
 */
export const performEventArrivalsOperation = async (
  location: EventArrivalsOperationLocation,
  kind: EventArrivalsOperationKind,
  tifAPI: TiFAPI
) => {
  const methodKey = kind === "arrived" ? "arriveAtEvents" : "departFromEvents"
  return await tifAPI[methodKey](location.eventIds, location.coordinate).then(
    (result) => result.data.arrivalStatuses
  )
}
