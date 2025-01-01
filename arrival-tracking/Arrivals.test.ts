import { mockEventLocation } from "@event-details-boundary/MockData"
import { mockLocationCoordinate2D } from "@location/MockData"
import { EventID, EventUserAttendeeStatus } from "TiFShared/domain-models/Event"
import { repeatElements } from "TiFShared/lib/Array"
import { EventArrivals, SyncableTrackableEvent } from "./Arrivals"
import { mockEventArrival, mockEventArrivalRegion } from "./MockData"
import { regionWithArrivalData } from "./TestHelpers"

describe("EventArrivals tests", () => {
  test("add arrival, basic", async () => {
    const arrival = mockEventArrival()
    const arrivals = new EventArrivals().addArrivals([arrival])
    expect(arrivals.regions).toEqual([
      regionWithArrivalData([arrival.eventId], arrival)
    ])
  })

  test("add arrival, does not add duplicates", async () => {
    const arrival = mockEventArrival()
    const arrivals = new EventArrivals([arrival]).addArrivals([arrival])
    expect(arrivals.regions).toEqual([
      regionWithArrivalData([arrival.eventId], arrival)
    ])
  })

  test("add arrivals, does not add duplicates", async () => {
    const arrival = mockEventArrival()
    const arrivals = new EventArrivals().addArrivals([arrival, arrival])
    expect(arrivals.regions).toEqual([
      regionWithArrivalData([arrival.eventId], arrival)
    ])
  })

  test("add arrivals, updates already existing arrival from earlier in the array", async () => {
    const arrival = mockEventArrival()
    const arrival2 = { ...arrival, coordinate: mockLocationCoordinate2D() }
    const arrival3 = mockEventArrival()
    const arrival4 = { ...arrival, coordinate: mockLocationCoordinate2D() }
    const arrivals = new EventArrivals().addArrivals([
      arrival,
      arrival2,
      arrival3,
      arrival4
    ])
    expect(arrivals.regions).toEqual([
      regionWithArrivalData([arrival3.eventId], arrival3),
      regionWithArrivalData([arrival4.eventId], arrival4)
    ])
  })

  test("add arrival, adds event id to already existing region", async () => {
    const region = {
      ...mockEventArrivalRegion(),
      eventIds: [1],
      hasArrived: true
    }
    const arrival = {
      ...mockEventArrival(),
      coordinate: region.coordinate,
      arrivalRadiusMeters: region.arrivalRadiusMeters
    }
    const arrivals = EventArrivals.fromRegions([region]).addArrivals([arrival])
    expect(arrivals.regions).toEqual([
      regionWithArrivalData([1, arrival.eventId], arrival)
    ])
  })

  test("add arrival, updates the region of an existing event id, removes the original region if no other events in said region", async () => {
    const arrival = mockEventArrival()
    const newArrival = { ...arrival, coordinate: mockLocationCoordinate2D() }
    const arrivals = new EventArrivals([arrival]).addArrivals([newArrival])
    expect(arrivals.regions).toEqual([
      regionWithArrivalData([newArrival.eventId], newArrival)
    ])
  })

  test("add arrival, updates the region of an existing event id, adds a new region if no other events in said region", async () => {
    const region = mockEventArrivalRegion()
    const baseArrivals = repeatElements(2, () => {
      return {
        ...mockEventArrival(),
        coordinate: region.coordinate,
        arrivalRadiusMeters: region.arrivalRadiusMeters
      }
    })
    const newArrival = {
      ...baseArrivals[0],
      coordinate: mockLocationCoordinate2D()
    }
    const arrivals = new EventArrivals(baseArrivals).addArrivals([newArrival])
    expect(arrivals.regions).toEqual([
      regionWithArrivalData([baseArrivals[1].eventId], baseArrivals[1]),
      regionWithArrivalData([newArrival.eventId], newArrival)
    ])
  })

  test("add arrival, updates the region of an existing event id, moves event to existing region if new region is tracked", async () => {
    const baseArrivals = repeatElements(3, () => {
      return mockEventArrival()
    })
    const newArrival = {
      ...baseArrivals[2],
      coordinate: baseArrivals[0].coordinate,
      arrivalRadiusMeters: baseArrivals[0].arrivalRadiusMeters
    }
    const arrivals = new EventArrivals(baseArrivals).addArrivals([newArrival])
    expect(arrivals.regions).toEqual([
      regionWithArrivalData(
        [baseArrivals[0].eventId, newArrival.eventId],
        newArrival
      ),
      regionWithArrivalData([baseArrivals[1].eventId], baseArrivals[1])
    ])
  })

  test("remove arrival, basic", async () => {
    const arrivals = new EventArrivals()
      .addArrivals([
        {
          ...mockEventArrival(),
          eventId: 1
        }
      ])
      .removeArrivalsByEventIds([1])
    expect(arrivals.regions).toEqual([])
  })

  test("remove arrival, keeps region when there are still arrivals left at the same region", async () => {
    const region = mockEventArrivalRegion()
    const baseArrivals = repeatElements(2, () => {
      return {
        ...mockEventArrival(),
        coordinate: region.coordinate,
        arrivalRadiusMeters: region.arrivalRadiusMeters
      }
    })
    const arrivals = new EventArrivals(baseArrivals).removeArrivalsByEventIds([
      baseArrivals[0].eventId
    ])
    expect(arrivals.regions).toEqual([
      regionWithArrivalData([baseArrivals[1].eventId], baseArrivals[1])
    ])
  })

  test("remove arrival, does nothing when no tracked arrivals", async () => {
    const arrivals = new EventArrivals().removeArrivalsByEventIds([1])
    expect(arrivals.regions).toEqual([])
  })

  test("remove arrival, does nothing when given arrival not tracked", async () => {
    const trackedArrival = { ...mockEventArrival(), eventId: 2 }
    const arrivals = new EventArrivals([
      trackedArrival
    ]).removeArrivalsByEventIds([1])
    expect(arrivals.regions).toEqual([
      regionWithArrivalData([2], trackedArrival)
    ])
  })

  test("remove arrivals, basic", async () => {
    const baseArrivals = repeatElements(2, () => mockEventArrival())
    const arrivals = new EventArrivals(baseArrivals).removeArrivalsByEventIds([
      baseArrivals[0].eventId,
      baseArrivals[1].eventId
    ])
    expect(arrivals.regions).toEqual([])
  })

  test("remove arrivals, only removes arrivals with event ids", async () => {
    const baseArrivals = repeatElements(2, () => mockEventArrival())
    const arrivals = new EventArrivals(baseArrivals).removeArrivalsByEventIds([
      baseArrivals[0].eventId
    ])
    expect(arrivals.regions).toMatchObject([
      regionWithArrivalData([baseArrivals[1].eventId], baseArrivals[1])
    ])
  })

  test("sync trackable attending events, no updates when no events", async () => {
    const arrivals = new EventArrivals().syncTrackableAttendingEvents([])
    expect(arrivals.regions).toEqual([])
  })

  test("sync trackable attending events, adds events which the user has joined and in arrival period", async () => {
    const event1 = testEvent(1, true, "hosting")
    const event2 = testEvent(2, true, "attending")
    const arrivals = new EventArrivals().syncTrackableAttendingEvents([
      event1,
      event2
    ])
    expect(arrivals.regions).toEqual([
      regionWithEventData([1], event1),
      regionWithEventData([2], event2)
    ])
  })

  it("sync trackable attending events, removes events which the user has not joined and in arrival period", async () => {
    const arrival = { ...mockEventArrival(), eventId: 1 }
    const event = testEvent(arrival.eventId, true, "not-participating")
    const arrivals = new EventArrivals([arrival]).syncTrackableAttendingEvents([
      event
    ])
    expect(arrivals.regions).toEqual([])
  })

  it("sync trackable attending events, removes events when not in arrival period", async () => {
    const baseArrivals = repeatElements(2, (eventId) => ({
      ...mockEventArrival(),
      eventId
    }))

    const event = testEvent(baseArrivals[0].eventId, false, "hosting")
    const event2 = testEvent(
      baseArrivals[1].eventId,
      false,
      "not-participating"
    )
    const arrivals = new EventArrivals(
      baseArrivals
    ).syncTrackableAttendingEvents([event, event2])
    expect(arrivals.regions).toEqual([])
  })

  test("sync trackable attending events, adds and removes events", async () => {
    const initialArrival = { ...mockEventArrival(), eventId: 1 }
    const event = testEvent(initialArrival.eventId, false, "attending")
    const event2 = testEvent(2, true, "hosting")
    const arrivals = new EventArrivals([
      initialArrival
    ]).syncTrackableAttendingEvents([event, event2])
    expect(arrivals.regions).toEqual([regionWithEventData([2], event2)])
  })

  const regionWithEventData = (
    eventIds: EventID[],
    event: SyncableTrackableEvent
  ) => ({
    eventIds,
    arrivalRadiusMeters: event.location.arrivalRadiusMeters,
    hasArrived: false,
    coordinate: event.location.coordinate
  })

  const testEvent = (
    id: number,
    isInArrivalTrackingPeriod: boolean,
    attendeeStatus: EventUserAttendeeStatus
  ) => ({
    id,
    location: { ...mockEventLocation(), isInArrivalTrackingPeriod },
    userAttendeeStatus: attendeeStatus,
    hasArrived: false
  })
})
