import { SQLiteEventArrivalsStorage } from "./Storage"
import { EventArrivalsTracker } from "./Tracker"
import { waitFor } from "@testing-library/react-native"
import {
  mockEventArrival,
  mockEventArrivalGeofencedRegion,
  mockEventArrivalRegion
} from "./MockData"
import { neverPromise } from "@test-helpers/Promise"
import { TestEventArrivalsGeofencer } from "./geofencing/TestGeofencer"
import { verifyNeverOccurs } from "@test-helpers/ExpectNeverOccurs"
import { resetTestSQLiteBeforeEach, testSQLite } from "@test-helpers/SQLite"
import { repeatElements } from "TiFShared/lib/Array"
import {
  addTestArrivals,
  expectOrderInsensitiveEventArrivals,
  regionWithArrivalData
} from "./TestHelpers"
import { EventArrivals } from "./Arrivals"

describe("EventArrivalsTracker tests", () => {
  const upcomingArrivals = new SQLiteEventArrivalsStorage(testSQLite)
  resetTestSQLiteBeforeEach()

  const testGeofencer = new TestEventArrivalsGeofencer()

  const performArrivalOperation = jest.fn()
  const tracker = new EventArrivalsTracker(
    upcomingArrivals,
    testGeofencer,
    performArrivalOperation
  )
  beforeEach(() => {
    testGeofencer.reset()
    tracker.startTracking()
  })
  afterEach(() => {
    performArrivalOperation.mockReset()
  })

  test("refresh arrivals", async () => {
    const arrivals = EventArrivals.fromRegions(
      repeatElements(2, () => mockEventArrivalRegion())
    )
    await tracker.refreshArrivals(jest.fn().mockResolvedValueOnce(arrivals))
    await expectTrackedArrivals(arrivals)
  })

  test("transform arrivals", async () => {
    const arrival = mockEventArrival()
    await tracker.transformTrackedArrivals((arrivals) =>
      arrivals.addArrivals([arrival])
    )
    await expectTrackedArrivals(
      EventArrivals.fromRegions([
        regionWithArrivalData([arrival.eventId], arrival)
      ])
    )
  })

  test("subscribes to geofencing updates when new instance detects previously tracked arrivals", async () => {
    await addTestArrivals(tracker, mockEventArrival())
    tracker.stopTracking()
    expect(testGeofencer.hasSubscriber).toEqual(false)
    const tracker2 = new EventArrivalsTracker(
      upcomingArrivals,
      testGeofencer,
      jest.fn()
    )
    tracker2.startTracking()
    expect(testGeofencer.hasSubscriber).toEqual(true)
  })

  test("handle geofencing update, does arrived operation for all arrivals when entering region", async () => {
    performArrivalOperation.mockImplementationOnce(neverPromise)
    await addTestArrivals(tracker, mockEventArrival())
    const region = { ...mockEventArrivalGeofencedRegion(), hasArrived: true }
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

  test("handle geofencing update, does departed operation for all arrivals when exiting region", async () => {
    performArrivalOperation.mockImplementationOnce(neverPromise)
    await addTestArrivals(tracker, mockEventArrival())
    const region = { ...mockEventArrivalGeofencedRegion(), hasArrived: false }
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
    const newArrivals = EventArrivals.fromRegions(
      repeatElements(3, () => mockEventArrivalRegion())
    )
    performArrivalOperation.mockResolvedValueOnce(newArrivals)
    await addTestArrivals(tracker, mockEventArrival())
    testGeofencer.sendUpdate(mockEventArrivalGeofencedRegion())
    await expectTrackedArrivals(newArrivals)
  })

  test("publishes update after performing an arrivals operation", async () => {
    const newArrivals = EventArrivals.fromRegions(
      repeatElements(3, () => mockEventArrivalRegion())
    )
    performArrivalOperation.mockResolvedValueOnce(newArrivals)
    await addTestArrivals(tracker, mockEventArrival())
    const callback = jest.fn()
    tracker.subscribe(callback)
    await waitFor(() => expect(callback).toHaveBeenCalled())

    const geofencedRegion = {
      ...mockEventArrivalGeofencedRegion(),
      hasArrived: true
    }
    testGeofencer.sendUpdate(geofencedRegion)
    await waitFor(() => {
      expectOrderInsensitiveEventArrivals(
        callback.mock.lastCall[0],
        newArrivals
      )
    })
    expect(callback).toHaveBeenCalledTimes(2)
  })

  test("does not publish update after unsubscribing from arrivals operation updates", async () => {
    performArrivalOperation.mockResolvedValueOnce(
      EventArrivals.fromRegions([mockEventArrivalRegion()])
    )
    await addTestArrivals(tracker, mockEventArrival())
    const callback = jest.fn()
    const subscription = tracker.subscribe(callback)
    await waitFor(() => expect(callback).toHaveBeenCalled())
    subscription.unsubscribe()
    testGeofencer.sendUpdate(mockEventArrivalGeofencedRegion())
    await verifyNeverOccurs(() => expect(callback).toHaveBeenCalledTimes(2))
  })

  it("should publish an empty update when failing to replace arrivals on geofencer", async () => {
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
    await addTestArrivals(tracker, arrival)
    await waitFor(() =>
      expect(callback).toHaveBeenCalledWith(new EventArrivals())
    )
    expect(callback).toHaveBeenCalledTimes(1)
  })

  const expectTrackedArrivals = async (arrivals: EventArrivals) => {
    await waitFor(async () => {
      const trackedArrivals = await tracker.trackedArrivals()
      expectOrderInsensitiveEventArrivals(trackedArrivals, arrivals)
    })
    expect(testGeofencer.geofencedRegions).toMatchObject(
      expect.arrayContaining(arrivals.regions)
    )
    expect(testGeofencer.geofencedRegions).toHaveLength(arrivals.regions.length)

    const callback = jest.fn()
    const subscription = tracker.subscribe(callback)
    await subscription.waitForInitialRegionsToLoad()
    expectOrderInsensitiveEventArrivals(callback.mock.lastCall[0], arrivals)
    expect(callback).toHaveBeenCalledTimes(1)
  }
})
