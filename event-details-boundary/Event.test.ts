import { waitFor } from "@testing-library/react-native"
import {
  copyEventLocationToClipboard,
  updateEventsInArrivalsTracker
} from "./Event"
import {
  EventArrivalsTracker,
  SQLiteUpcomingEventArrivals
} from "@arrival-tracking"
import { TestEventArrivalsGeofencer } from "@arrival-tracking/geofencing/TestGeofencer"
import { mockEventLocation } from "./MockData"
import { mockEventArrival } from "@arrival-tracking/MockData"
import { resetTestSQLiteBeforeEach, testSQLite } from "@test-helpers/SQLite"
import { repeatElements } from "TiFShared/lib/Array"
import {
  EventUserAttendeeStatus,
  EventArrivalRegion
} from "TiFShared/domain-models/Event"

describe("Event tests", () => {
  describe("UpdateEventsInArrivalTracker tests", () => {
    const upcomingArrivals = new SQLiteUpcomingEventArrivals(testSQLite)
    resetTestSQLiteBeforeEach()

    const tracker = new EventArrivalsTracker(
      upcomingArrivals,
      new TestEventArrivalsGeofencer(),
      jest.fn()
    )

    it("should not update the tracker when no events given", async () => {
      await updateEventsInArrivalsTracker([], tracker)
      await expectTrackedRegions([])
    })

    it("should add events to the tracker which the user has joined and when the tracking period has begun", async () => {
      const event1 = testEvent(1, true, "hosting")
      const event2 = testEvent(2, true, "attending")
      await updateEventsInArrivalsTracker([event1, event2], tracker)
      await expectTrackedRegions([
        {
          eventIds: [1],
          arrivalRadiusMeters: event1.location.arrivalRadiusMeters,
          hasArrived: false,
          coordinate: event1.location.coordinate
        },
        {
          eventIds: [2],
          arrivalRadiusMeters: event2.location.arrivalRadiusMeters,
          hasArrived: false,
          coordinate: event2.location.coordinate
        }
      ])
    })

    it("should remove events from the tracker which the user has not joined and when the tracking period has begun", async () => {
      const arrival = { ...mockEventArrival(), eventId: 1 }
      await tracker.trackArrival(arrival)
      const event = testEvent(arrival.eventId, true, "not-participating")
      await updateEventsInArrivalsTracker([event], tracker)
      await expectTrackedRegions([])
    })

    it("should remove events from the tracker when the arrival period has not begun", async () => {
      const arrivals = repeatElements(2, (eventId) => ({
        ...mockEventArrival(),
        eventId
      }))
      await tracker.trackArrivals(arrivals)
      const event = testEvent(arrivals[0].eventId, false, "hosting")
      const event2 = testEvent(arrivals[1].eventId, false, "not-participating")
      await updateEventsInArrivalsTracker([event, event2], tracker)
      await expectTrackedRegions([])
    })

    test("adds and removes events from tracker based on join date and arrival status", async () => {
      const initialArrival = { ...mockEventArrival(), eventId: 1 }
      await tracker.trackArrival(initialArrival)
      const event = testEvent(initialArrival.eventId, false, "attending")
      const event2 = testEvent(2, true, "hosting")
      await updateEventsInArrivalsTracker([event, event2], tracker)
      await expectTrackedRegions([
        {
          eventIds: [2],
          arrivalRadiusMeters: event2.location.arrivalRadiusMeters,
          hasArrived: false,
          coordinate: event2.location.coordinate
        }
      ])
    })

    const testEvent = (
      id: number,
      isInArrivalTrackingPeriod: boolean,
      attendeeStatus: EventUserAttendeeStatus
    ) => ({
      id,
      location: { ...mockEventLocation(), isInArrivalTrackingPeriod },
      userAttendeeStatus: attendeeStatus
    })

    const expectTrackedRegions = async (regions: EventArrivalRegion[]) => {
      await waitFor(async () => {
        expect(await upcomingArrivals.all()).toEqual(
          expect.arrayContaining(regions)
        )
      })
    }
  })
})
