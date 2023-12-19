import {
  EventArrival,
  EventArrivalOperationResult
} from "@shared-models/EventArrivals"

export type EventArrivalOperationKind = "arrived" | "departed"

export type PerformArrivalsOperation = (
  arrivals: EventArrival[],
  operation: EventArrivalOperationKind
) => Promise<EventArrivalOperationResult[]>
