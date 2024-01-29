import { AsyncStorageUpcomingEventArrivals } from "./UpcomingArrivals"
import { EventArrivalsTracker } from "./Tracker"
import { EventArrivalRegion } from "@shared-models/EventArrivals"
import { ArrayUtils } from "@lib/utils/Array"
import { waitFor } from "@testing-library/react-native"
import { mockLocationCoordinate2D } from "@location/MockData"
import {
  mockEventArrival,
  mockEventArrivalGeofencedRegion,
  mockEventArrivalRegion
} from "./MockData"
import { neverPromise } from "@test-helpers/Promise"
import { TestEventArrivalsGeofencer } from "./geofencing/TestGeofencer"
import { clearAsyncStorageBeforeEach } from "@test-helpers/AsyncStorage"
import { verifyNeverOccurs } from "@test-helpers/ExpectNeverOccurs"

describe("EventArrivalsTracker tests", () => {
  const upcomingArrivals = new AsyncStorageUpcomingEventArrivals()
  clearAsyncStorageBeforeEach()

  const testGeofencer = new TestEventArrivalsGeofencer()

  const performArrivalOperation = jest.fn()
  beforeEach(() => testGeofencer.reset())
  afterEach(() => {
    performArrivalOperation.mockReset()
  })

  const tracker = new EventArrivalsTracker(
    upcomingArrivals,
    testGeofencer,
    performArrivalOperation
  )

  test("refresh arrivals", async () => {
    const regions = ArrayUtils.repeatElements(2, () => {
      return mockEventArrivalRegion()
    })
    await tracker.refreshArrivals(jest.fn().mockResolvedValueOnce(regions))
    await expectTrackedRegions(regions)
  })

  test("track arrival, basic", async () => {
    const arrival = mockEventArrival()
    await tracker.trackArrival(arrival)
    await expectTrackedRegions([
      {
        eventIds: [arrival.eventId],
        coordinate: arrival.coordinate,
        arrivalRadiusMeters: arrival.arrivalRadiusMeters,
        isArrived: false
      }
    ])
  })

  test("track arrival, does not add duplicates", async () => {
    const arrival = mockEventArrival()
    await tracker.trackArrival(arrival)
    await tracker.trackArrival(arrival)
    await expectTrackedRegions([
      {
        eventIds: [arrival.eventId],
        coordinate: arrival.coordinate,
        arrivalRadiusMeters: arrival.arrivalRadiusMeters,
        isArrived: false
      }
    ])
  })

  test("track arrivals, does not add duplicates", async () => {
    const arrival = mockEventArrival()
    await tracker.trackArrivals([arrival, arrival])
    await expectTrackedRegions([
      {
        eventIds: [arrival.eventId],
        coordinate: arrival.coordinate,
        arrivalRadiusMeters: arrival.arrivalRadiusMeters,
        isArrived: false
      }
    ])
  })

  test("track arrivals, updates already existing arrival from earlier in the array", async () => {
    const arrival = mockEventArrival()
    const arrival2 = { ...arrival, coordinate: mockLocationCoordinate2D() }
    const arrival3 = mockEventArrival()
    const arrival4 = { ...arrival, coordinate: mockLocationCoordinate2D() }
    await tracker.trackArrivals([arrival, arrival2, arrival3, arrival4])
    await expectTrackedRegions([
      {
        eventIds: [arrival3.eventId],
        coordinate: arrival3.coordinate,
        arrivalRadiusMeters: arrival3.arrivalRadiusMeters,
        isArrived: false
      },
      {
        eventIds: [arrival4.eventId],
        coordinate: arrival4.coordinate,
        arrivalRadiusMeters: arrival4.arrivalRadiusMeters,
        isArrived: false
      }
    ])
  })

  test("track arrival, adds event id to already existing region", async () => {
    const region = {
      ...mockEventArrivalRegion(),
      eventIds: [1],
      isArrived: true
    }
    const arrival = {
      ...mockEventArrival(),
      coordinate: region.coordinate,
      arrivalRadiusMeters: region.arrivalRadiusMeters
    }
    await tracker.refreshArrivals(jest.fn().mockResolvedValueOnce([region]))
    await tracker.trackArrival(arrival)
    await expectTrackedRegions([
      {
        ...region,
        eventIds: [1, arrival.eventId]
      }
    ])
  })

  test("track arrival, updates the region of an existing event id, removes the original region if no other events in said region", async () => {
    const arrival = mockEventArrival()
    await tracker.trackArrival(arrival)
    const newArrival = { ...arrival, coordinate: mockLocationCoordinate2D() }
    await tracker.trackArrival(newArrival)
    await expectTrackedRegions([
      {
        eventIds: [newArrival.eventId],
        coordinate: newArrival.coordinate,
        arrivalRadiusMeters: newArrival.arrivalRadiusMeters,
        isArrived: false
      }
    ])
  })

  test("track arrival, updates the region of an existing event id, adds a new region if no other events in said region", async () => {
    const region = mockEventArrivalRegion()
    const arrivals = ArrayUtils.repeatElements(2, () => {
      return {
        ...mockEventArrival(),
        coordinate: region.coordinate,
        arrivalRadiusMeters: region.arrivalRadiusMeters
      }
    })
    await tracker.trackArrivals(arrivals)
    const newArrival = {
      ...arrivals[1],
      coordinate: mockLocationCoordinate2D()
    }
    await tracker.trackArrival(newArrival)
    await expectTrackedRegions([
      {
        eventIds: [arrivals[0].eventId],
        coordinate: arrivals[0].coordinate,
        arrivalRadiusMeters: arrivals[0].arrivalRadiusMeters,
        isArrived: false
      },
      {
        eventIds: [newArrival.eventId],
        coordinate: newArrival.coordinate,
        arrivalRadiusMeters: newArrival.arrivalRadiusMeters,
        isArrived: false
      }
    ])
  })

  test("track arrival, updates the region of an existing event id, moves event to existing region if new region is tracked", async () => {
    const arrivals = ArrayUtils.repeatElements(3, () => {
      return mockEventArrival()
    })
    await tracker.trackArrivals(arrivals)
    const newArrival = {
      ...arrivals[2],
      coordinate: arrivals[0].coordinate,
      arrivalRadiusMeters: arrivals[0].arrivalRadiusMeters
    }
    await tracker.trackArrival(newArrival)
    await expectTrackedRegions([
      {
        eventIds: [arrivals[0].eventId, newArrival.eventId],
        coordinate: arrivals[0].coordinate,
        arrivalRadiusMeters: arrivals[0].arrivalRadiusMeters,
        isArrived: false
      },
      {
        eventIds: [arrivals[1].eventId],
        coordinate: arrivals[1].coordinate,
        arrivalRadiusMeters: arrivals[1].arrivalRadiusMeters,
        isArrived: false
      }
    ])
  })

  test("remove arrival, basic", async () => {
    await tracker.trackArrival({ ...mockEventArrival(), eventId: 1 })
    await tracker.removeArrivalByEventId(1)
    await expectTrackedRegions([])
  })

  test("remove arrival, keeps region when there are still arrivals left at the same region", async () => {
    const region = mockEventArrivalRegion()
    const arrivals = ArrayUtils.repeatElements(2, () => {
      return {
        ...mockEventArrival(),
        coordinate: region.coordinate,
        arrivalRadiusMeters: region.arrivalRadiusMeters
      }
    })
    await tracker.trackArrivals(arrivals)
    await tracker.removeArrivalByEventId(arrivals[0].eventId)
    await expectTrackedRegions([
      {
        eventIds: [arrivals[1].eventId],
        coordinate: region.coordinate,
        arrivalRadiusMeters: region.arrivalRadiusMeters,
        isArrived: false
      }
    ])
  })

  test("remove arrival, does nothing when no tracked arrivals", async () => {
    await tracker.removeArrivalByEventId(1)
    await expectTrackedRegions([])
  })

  test("remove arrival, does nothing when given arrival not tracked", async () => {
    const trackedArrival = { ...mockEventArrival(), eventId: 2 }
    await tracker.trackArrival(trackedArrival)
    await tracker.removeArrivalByEventId(1)
    await expectTrackedRegions([
      {
        eventIds: [2],
        coordinate: trackedArrival.coordinate,
        arrivalRadiusMeters: trackedArrival.arrivalRadiusMeters,
        isArrived: false
      }
    ])
  })

  test("does not subscribe to geofencing updates when no tracked arrivals", async () => {
    await tracker.startTracking()
    expect(testGeofencer.hasSubscriber).toEqual(false)
  })

  test("subscribes to geofencing updates when new instance detects previously tracked arrivals", async () => {
    await tracker.trackArrival(mockEventArrival())
    tracker.stopTracking()
    expect(testGeofencer.hasSubscriber).toEqual(false)
    const tracker2 = new EventArrivalsTracker(
      upcomingArrivals,
      testGeofencer,
      jest.fn()
    )
    await tracker2.startTracking()
    expect(testGeofencer.hasSubscriber).toEqual(true)
  })

  test("unsubscribes from tracker when removing all tracked arrivals", async () => {
    const arrival = mockEventArrival()
    await tracker.trackArrival(arrival)
    expect(testGeofencer.hasSubscriber).toEqual(true)
    await tracker.removeArrivalByEventId(arrival.eventId)
    expect(testGeofencer.hasSubscriber).toEqual(false)
  })

  test("handle geofencing update, does \"arrived\" operation for all arrivals when entering region", async () => {
    performArrivalOperation.mockImplementationOnce(neverPromise)
    await tracker.trackArrival(mockEventArrival())
    const region = { ...mockEventArrivalGeofencedRegion(), isArrived: true }
    testGeofencer.sendUpdate(region)
    await waitFor(() => {
      expect(performArrivalOperation).toHaveBeenCalledWith(
        expect.objectContaining({
          coordinate: region.coordinate,
          arrivalRadiusMeters: region.arrivalRadiusMeters
        }),
        "arrived"
      )
    })
  })

  test("handle geofencing update, does \"departed\" operation for all arrivals when exiting region", async () => {
    performArrivalOperation.mockImplementationOnce(neverPromise)
    await tracker.trackArrival(mockEventArrival())
    const region = { ...mockEventArrivalGeofencedRegion(), isArrived: false }
    testGeofencer.sendUpdate(region)
    await waitFor(() => {
      expect(performArrivalOperation).toHaveBeenCalledWith(
        expect.objectContaining({
          coordinate: region.coordinate,
          arrivalRadiusMeters: region.arrivalRadiusMeters
        }),
        "departed"
      )
    })
  })

  test("replaces all tracked regions when performing an arrivals operation", async () => {
    const newRegions = ArrayUtils.repeatElements(3, () => {
      return mockEventArrivalRegion()
    })
    performArrivalOperation.mockResolvedValueOnce(newRegions)
    await tracker.trackArrival(mockEventArrival())
    testGeofencer.sendUpdate(mockEventArrivalGeofencedRegion())
    await expectTrackedRegions(newRegions)
  })

  test("publishes update after performing an arrivals operation", async () => {
    const newRegions = ArrayUtils.repeatElements(3, () => {
      return mockEventArrivalRegion()
    })
    performArrivalOperation.mockResolvedValueOnce(newRegions)
    await tracker.trackArrival(mockEventArrival())
    const callback = jest.fn()
    tracker.subscribe(callback)
    await waitFor(() => expect(callback).toHaveBeenCalled())

    const geofencedRegion = {
      ...mockEventArrivalGeofencedRegion(),
      isArrived: true
    }
    testGeofencer.sendUpdate(geofencedRegion)
    await waitFor(() => {
      expect(callback).toHaveBeenNthCalledWith(2, newRegions)
    })
    expect(callback).toHaveBeenCalledTimes(2)
  })

  test("does not publish update after unsubscribing from arrivals operation updates", async () => {
    performArrivalOperation.mockResolvedValueOnce([mockEventArrivalRegion()])
    await tracker.trackArrival(mockEventArrival())
    const callback = jest.fn()
    const subscription = tracker.subscribe(callback)
    await waitFor(() => expect(callback).toHaveBeenCalled())
    subscription.unsubscribe()
    testGeofencer.sendUpdate(mockEventArrivalGeofencedRegion())
    await verifyNeverOccurs(() => expect(callback).toHaveBeenCalledTimes(2))
  })

  it("should not publish an update when failing to replace arrivals on geofencer", async () => {
    const arrival = mockEventArrival()
    const tracker = new EventArrivalsTracker(
      upcomingArrivals,
      {
        replaceGeofencedRegions: jest
          .fn()
          .mockRejectedValueOnce(
            new Error("No Background location permissions enabled")
          ),
        onUpdate: jest.fn()
      },
      performArrivalOperation
    )
    const callback = jest.fn()
    const subscription = tracker.subscribe(callback)
    await subscription.waitForInitialRegionsToLoad()
    callback.mockReset()
    await tracker.trackArrival(arrival)
    await verifyNeverOccurs(() => expect(callback).toHaveBeenCalled())
  })

  const expectTrackedRegions = async (regions: EventArrivalRegion[]) => {
    await waitFor(async () => {
      expect(await upcomingArrivals.all()).toEqual(regions)
    })
    expect(regions).toMatchObject(testGeofencer.geofencedRegions)

    const callback = jest.fn()
    const subscription = tracker.subscribe(callback)
    await subscription.waitForInitialRegionsToLoad()
    expect(callback).toHaveBeenCalledWith(regions)
    expect(callback).toHaveBeenCalledTimes(1)
  }
})
