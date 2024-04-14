import { EventID } from "TiFShared/domain-models/Event"
import { EventArrival } from "./Arrivals"
import { EventArrivalsTracker } from "./Tracker"

export const regionWithArrivalData = (
  eventIds: EventID[],
  arrival: EventArrival
) => ({
  coordinate: arrival.coordinate,
  hasArrived: arrival.hasArrived,
  arrivalRadiusMeters: arrival.arrivalRadiusMeters,
  eventIds
})

export const addTestArrivals = async (
  tracker: EventArrivalsTracker,
  ...arrivals: EventArrival[]
) => {
  await tracker.transformArrivals((a) => a.addArrivals(arrivals))
}

export const removeTestArrivals = async (
  tracker: EventArrivalsTracker,
  ...eventIds: EventID[]
) => {
  await tracker.transformArrivals((a) => a.removeArrivalsByEventIds(eventIds))
}
