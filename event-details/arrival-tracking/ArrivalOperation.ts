import {
  EventArrivalOperationResult,
  EventArrivalsOperationLocation
} from "@shared-models/EventArrivals"

export type PerformArrivalsOperation = (
  location: EventArrivalsOperationLocation,
  operation: "arrived" | "departed"
) => Promise<EventArrivalOperationResult[]>
