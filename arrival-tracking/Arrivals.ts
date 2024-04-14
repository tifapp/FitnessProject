import {
  EventArrivalRegion,
  EventID,
  areEventRegionsEqual,
  isAttendingEvent
} from "TiFShared/domain-models/Event"
import { ClientSideEvent } from "@event/ClientSideEvent"
import "TiFShared/lib/Zod"

/**
 * Event arrivals are sent as notifications when the user enters the area of an event,
 * so that other participants are aware of their arrival.
 *
 * The scheduling/sending of the push notifications is handled server-side.
 */
export type EventArrival = Omit<EventArrivalRegion, "eventIds"> & {
  eventId: EventID
}

/**
 * Removes arrivals in the given array by whether or not they have the same event id.
 *
 * The latest occurrence of the last arrival is the one that remains.
 */
export const removeDuplicateArrivals = (arrivals: EventArrival[]) => {
  const idIndexMap = arrivals.reduce((acc, arrival, index) => {
    return acc.set(arrival.eventId, index)
  }, new Map<EventID, number>())
  return arrivals.filter(
    (arrival, index) => idIndexMap.get(arrival.eventId) === index
  )
}

/**
 * Creates an {@link EventArrivalRegion} using the `eventId` from a given
 * {@link EventArrival} as a single element in the initial array of `eventIds`.
 *
 * @param arrival See {@link EventArrival}
 * @param hasArrived Whether or not to mark the initial state as arrived.
 */
export const arrivalRegion = (
  arrival: EventArrival,
  hasArrived?: boolean
): EventArrivalRegion => ({
  eventIds: [arrival.eventId],
  coordinate: arrival.coordinate,
  arrivalRadiusMeters: arrival.arrivalRadiusMeters,
  hasArrived: hasArrived ?? arrival.hasArrived
})

/**
 * An immutable collection that manages {@link EventArrival}s and their
 * associated {@link EventArrivalRegion}s.
 */
export class EventArrivals {
  private _regions = [] as EventArrivalRegion[]

  /**
   * The {@link EventArrivalRegion}s which make up this collection of arrivals.
   */
  get regions() {
    return this._regions
  }

  static fromRegions(regions: EventArrivalRegion[]) {
    const arrivals = new EventArrivals()
    arrivals._regions = regions
    return arrivals
  }

  addArrivals(arrivals: EventArrival[]) {
    const deduplicatedArrivals = removeDuplicateArrivals(arrivals)
    const strippedRegions = this.removeArrivalsByEventIds(
      deduplicatedArrivals.map((arrival) => arrival.eventId)
    )
    const newRegions = deduplicatedArrivals.reduce((acc, arrival) => {
      const regionIndex = acc.findIndex((region) => {
        return areEventRegionsEqual(region, arrival)
      })
      if (regionIndex === -1) return acc.concat(arrivalRegion(arrival))
      return acc.with(regionIndex, {
        ...acc[regionIndex],
        eventIds: acc[regionIndex].eventIds.concat(arrival.eventId),
        hasArrived: arrival.hasArrived
      })
    }, strippedRegions.regions)
    return EventArrivals.fromRegions(newRegions)
  }

  removeArrivalsByEventIds(eventIds: EventID[]) {
    const newRegions = this.regions.ext.compactMap((region) => {
      const newEventIds = region.eventIds.filter((id) => !eventIds.includes(id))
      if (newEventIds.length === 0) return undefined
      return { ...region, eventIds: newEventIds }
    })
    return EventArrivals.fromRegions(newRegions)
  }

  /**
   * Adds arrivals with matching {@link EventID}s and regions from a list of
   * {@link ClientSideEvent}s if the user has joined the event, and if the
   * event is in its arrival tracking period.
   *
   * If a user has not joined an event in the list, or if that event is not in
   * its arrival tracking period, a corresponding arrival with the matching
   * {@link EventID} is removed from this collection.
   *
   * @param events A list of events to synchronize.
   * @returns A new {@link EventArrivals} instance with the changes applied.
   */
  syncTrackableAttendingEvents(events: SyncableTrackableEvent[]) {
    const idsToRemove = events.filter((e) => !canTrackEvent(e)).map((e) => e.id)
    const arrivalsToTrack = events.filter(canTrackEvent).map((e) => ({
      eventId: e.id,
      coordinate: e.location.coordinate,
      arrivalRadiusMeters: e.location.arrivalRadiusMeters,
      hasArrived: e.hasArrived
    }))
    return this.removeArrivalsByEventIds(idsToRemove).addArrivals(
      arrivalsToTrack
    )
  }
}

export type SyncableTrackableEvent = Pick<
  ClientSideEvent,
  "id" | "userAttendeeStatus" | "hasArrived" | "location"
>

const canTrackEvent = (event: SyncableTrackableEvent) => {
  const isAttending = isAttendingEvent(event.userAttendeeStatus)
  return isAttending && event.location.isInArrivalTrackingPeriod
}
