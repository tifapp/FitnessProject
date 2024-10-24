import { EventID } from "TiFShared/domain-models/Event"
import { EventArrival, EventArrivals } from "./Arrivals"
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
  await tracker.transformTrackedArrivals((a) => a.addArrivals(arrivals))
}

export const removeTestArrivals = async (
  tracker: EventArrivalsTracker,
  ...eventIds: EventID[]
) => {
  await tracker.transformTrackedArrivals((a) =>
    a.removeArrivalsByEventIds(eventIds)
  )
}

export const expectOrderInsensitiveEventArrivals = (
  a1: EventArrivals,
  a2: EventArrivals
) => {
  expect(a1.regions).toEqual(expect.arrayContaining(a2.regions))
  expect(a1.regions).toHaveLength(a2.regions.length)
}
