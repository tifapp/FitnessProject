import { SQLiteUpcomingEventArrivals } from "./UpcomingArrivals"
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
import { EventArrivalRegion } from "TiFShared/domain-models/Event"
import {
  addTestArrivals,
  regionWithArrivalData,
  removeTestArrivals
} from "./TestHelpers"

describe("EventArrivalsTracker tests", () => {
  const upcomingArrivals = new SQLiteUpcomingEventArrivals(testSQLite)
  resetTestSQLiteBeforeEach()

  const testGeofencer = new TestEventArrivalsGeofencer()

  const performArrivalOperation = jest.fn()
  const tracker = new EventArrivalsTracker(
    upcomingArrivals,
    testGeofencer,
    performArrivalOperation
  )
  beforeEach(() => testGeofencer.reset())
  afterEach(() => {
    performArrivalOperation.mockReset()
  })

  test("refresh arrivals", async () => {
    const regions = repeatElements(2, () => {
      return mockEventArrivalRegion()
    })
    await tracker.refreshArrivals(jest.fn().mockResolvedValueOnce(regions))
    await expectTrackedRegions(regions)
  })

  test("transform arrivals", async () => {
    const arrival = mockEventArrival()
    await tracker.transformArrivals((arrivals) =>
      arrivals.addArrivals([arrival])
    )
    await expectTrackedRegions([
      regionWithArrivalData([arrival.eventId], arrival)
    ])
  })

  test("does not subscribe to geofencing updates when no tracked arrivals", async () => {
    await tracker.startTracking()
    expect(testGeofencer.hasSubscriber).toEqual(false)
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
    await tracker2.startTracking()
    expect(testGeofencer.hasSubscriber).toEqual(true)
  })

  test("unsubscribes from tracker when removing all tracked arrivals", async () => {
    const arrival = mockEventArrival()
    await addTestArrivals(tracker, arrival)
    expect(testGeofencer.hasSubscriber).toEqual(true)
    await removeTestArrivals(tracker, arrival.eventId)
    expect(testGeofencer.hasSubscriber).toEqual(false)
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
    const newRegions = repeatElements(3, () => {
      return mockEventArrivalRegion()
    })
    performArrivalOperation.mockResolvedValueOnce(newRegions)
    await addTestArrivals(tracker, mockEventArrival())
    testGeofencer.sendUpdate(mockEventArrivalGeofencedRegion())
    await expectTrackedRegions(newRegions)
  })

  test("publishes update after performing an arrivals operation", async () => {
    const newRegions = repeatElements(3, () => {
      return mockEventArrivalRegion()
    })
    performArrivalOperation.mockResolvedValueOnce(newRegions)
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
      expect(callback).toHaveBeenNthCalledWith(2, newRegions)
    })
    expect(callback).toHaveBeenCalledTimes(2)
  })

  test("does not publish update after unsubscribing from arrivals operation updates", async () => {
    performArrivalOperation.mockResolvedValueOnce([mockEventArrivalRegion()])
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
    await waitFor(() => expect(callback).toHaveBeenCalledWith([]))
    expect(callback).toHaveBeenCalledTimes(1)
  })

  const expectTrackedRegions = async (regions: EventArrivalRegion[]) => {
    await waitFor(async () => {
      const upcoming = await upcomingArrivals.all()
      expect(upcoming).toEqual(expect.arrayContaining(regions))
      expect(upcoming).toHaveLength(regions.length)
    })
    expect(testGeofencer.geofencedRegions).toMatchObject(
      expect.arrayContaining(regions)
    )
    expect(testGeofencer.geofencedRegions).toHaveLength(regions.length)

    const callback = jest.fn()
    const subscription = tracker.subscribe(callback)
    await subscription.waitForInitialRegionsToLoad()
    expect(callback).toHaveBeenCalledWith(expect.arrayContaining(regions))
    expect(callback).toHaveBeenCalledTimes(1)
  }
})
