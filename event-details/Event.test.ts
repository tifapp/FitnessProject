import { EventArrivalRegion } from "@shared-models/EventArrivals"
import { waitFor } from "@testing-library/react-native"
import {
  copyEventLocationToClipboard,
  isAttendingEvent,
  isHostingEvent,
  updateEventsInArrivalsTracker
} from "./Event"
import {
  AsyncStorageUpcomingEventArrivals,
  EventArrivalsTracker
} from "./arrival-tracking"
import { TestEventArrivalsGeofencer } from "./arrival-tracking/geofencing/TestGeofencer"
import { clearAsyncStorageBeforeEach } from "@test-helpers/AsyncStorage"
import { mockEventLocation } from "./MockData"
import { mockEventArrival } from "./arrival-tracking/MockData"
import { ArrayUtils } from "@lib/utils/Array"
import { EventUserAttendeeStatus } from "@shared-models/Event"

describe("Event tests", () => {
  describe("EventCurrentUserAttendeeStatus tests", () => {
    describe("isHostingEvent tests", () => {
      it("returns true for hosting", () => {
        expect(isHostingEvent("hosting")).toEqual(true)
      })

      it("returns false for attending", () => {
        expect(isHostingEvent("attending")).toEqual(false)
      })

      it("returns false for non-participating", () => {
        expect(isHostingEvent("not-participating")).toEqual(false)
      })
    })

    describe("isAttendingEvent tests", () => {
      it("returns true for hosting", () => {
        expect(isAttendingEvent("hosting")).toEqual(true)
      })

      it("returns true for attending", () => {
        expect(isAttendingEvent("attending")).toEqual(true)
      })

      it("returns false for not-participating", () => {
        expect(isAttendingEvent("not-participating")).toEqual(false)
      })
    })
  })

  describe("EventLocation tests", () => {
    const TEST_COORDINATES = { latitude: 45.238974, longitude: -122.3678 }
    const TEST_COORDINATES_FORMATTED = "45.238974, -122.3678"

    it("should copy coordinates to clipboard when no placemark availiable", async () => {
      const clipboard = jest.fn()
      await copyEventLocationToClipboard(
        { coordinate: TEST_COORDINATES },
        clipboard
      )
      expect(clipboard).toHaveBeenCalledWith(TEST_COORDINATES_FORMATTED)
    })

    it("should copy the coordinates to clipboard when placemark can't be formatted", async () => {
      const clipboard = jest.fn()
      await copyEventLocationToClipboard(
        {
          coordinate: TEST_COORDINATES,
          placemark: { name: "North Pacific Ocean" }
        },
        clipboard
      )
      expect(clipboard).toHaveBeenCalledWith(TEST_COORDINATES_FORMATTED)
    })

    it("should copy the formatted address of an event with a placemark", async () => {
      const clipboard = jest.fn()
      await copyEventLocationToClipboard(
        {
          coordinate: TEST_COORDINATES,
          placemark: {
            name: "Starbucks",
            country: "United States of America",
            postalCode: "69696",
            street: "Thing St",
            streetNumber: "6969",
            region: "CA",
            isoCountryCode: "US",
            city: "City"
          }
        },
        clipboard
      )
      expect(clipboard).toHaveBeenCalledWith("6969 Thing St, City, CA 69696")
    })
  })

  describe("UpdateEventsInArrivalTracker tests", () => {
    const upcomingArrivals = new AsyncStorageUpcomingEventArrivals()
    clearAsyncStorageBeforeEach()

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
          isArrived: false,
          coordinate: event1.location.coordinate
        },
        {
          eventIds: [2],
          arrivalRadiusMeters: event2.location.arrivalRadiusMeters,
          isArrived: false,
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
      const arrivals = ArrayUtils.repeatElements(2, (eventId) => ({
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
          isArrived: false,
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
        expect(await upcomingArrivals.all()).toEqual(regions)
      })
    }
  })
})
