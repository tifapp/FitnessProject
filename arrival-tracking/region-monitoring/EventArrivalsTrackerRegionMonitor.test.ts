import { mockLocationCoordinate2D } from "@location/MockData"
import { verifyNeverOccurs } from "@test-helpers/ExpectNeverOccurs"
import { fakeTimers } from "@test-helpers/Timers"
import { waitFor } from "@testing-library/react-native"
import { mockEventArrival, mockEventRegion } from "../MockData"
import { EventArrivals, arrivalRegion } from "../Arrivals"
import { EventArrivalsTracker } from "../Tracker"
import { SQLiteEventArrivalsStorage } from "../Storage"
import { TestEventArrivalsGeofencer } from "../geofencing/TestGeofencer"
import { EventArrivalsTrackerRegionMonitor } from "./EventArrivalsTrackerRegionMonitor"
import { ForegroundEventRegionMonitor } from "./ForegroundRegionMonitor"
import { advanceByForegroundMonitorBufferTime } from "./TestHelpers"
import { resetTestSQLiteBeforeEach, testSQLite } from "@test-helpers/SQLite"
import { LocationCoordinate2D } from "TiFShared/domain-models/LocationCoordinate2D"
import { addTestArrivals, removeTestArrivals } from "../TestHelpers"

describe("EventArrivalsTrackerRegionMonitor tests", () => {
  resetTestSQLiteBeforeEach()
  const performArrivalsOperation = jest.fn()
  const geofencer = new TestEventArrivalsGeofencer()
  const tracker = new EventArrivalsTracker(
    new SQLiteEventArrivalsStorage(testSQLite),
    geofencer,
    performArrivalsOperation
  )

  let sendForegroundLocationUpdate: (coordinate: LocationCoordinate2D) => void
  const createForegroundMonitor = () => {
    return new ForegroundEventRegionMonitor(async (callback) => {
      sendForegroundLocationUpdate = (coordinate) => {
        callback(coordinate)
        advanceByForegroundMonitorBufferTime()
      }
      return { remove: jest.fn() }
    })
  }
  let monitor = new EventArrivalsTrackerRegionMonitor(
    tracker,
    createForegroundMonitor()
  )
  beforeEach(() => {
    performArrivalsOperation.mockReset()
    geofencer.reset()
    monitor = new EventArrivalsTrackerRegionMonitor(
      tracker,
      createForegroundMonitor()
    )
  })
  fakeTimers()

  it("should indicate not arrived when no regions monitored", () => {
    expect(monitor.hasArrivedAtRegion(mockEventRegion())).toEqual(false)
  })

  it("should process foreground monitor updates when region is not in the tracker", async () => {
    const region = mockEventRegion()
    const callback = jest.fn()
    monitor.monitorRegion(region, callback)
    await waitFor(() => expect(callback).toHaveBeenNthCalledWith(1, false))

    sendForegroundLocationUpdate(region.coordinate)
    await waitFor(() => expect(callback).toHaveBeenCalledWith(true))
    expect(monitor.hasArrivedAtRegion(region)).toEqual(true)
  })

  it("should only emit initial arrival status from foreground monitor if region is not in the tracker", async () => {
    const region = mockEventRegion()
    const callback = jest.fn()
    monitor.monitorRegion(region, callback)
    await waitFor(() => expect(callback).toHaveBeenNthCalledWith(1, false))

    sendForegroundLocationUpdate(region.coordinate)
    await waitFor(() => expect(callback).toHaveBeenCalledWith(true))

    const callback2 = jest.fn()
    monitor.monitorRegion(region, callback2)
    await waitFor(() => expect(callback2).toHaveBeenCalledWith(true))
    expect(callback2).toHaveBeenCalledTimes(1)
    expect(monitor.hasArrivedAtRegion(region)).toEqual(true)
  })

  it("should filter updates from the foreground monitor when region is in the tracker", async () => {
    const arrival = testEventArrival()
    await addTestArrivals(tracker, arrival)
    const callback = jest.fn()
    monitor.monitorRegion(arrival, callback)
    await waitFor(() => expect(callback).toHaveBeenNthCalledWith(1, false))

    sendForegroundLocationUpdate(arrival.coordinate)
    await verifyNeverOccurs(() => {
      expect(callback).toHaveBeenCalledWith(true)
    })
    expect(monitor.hasArrivedAtRegion(arrival)).toEqual(false)
  })

  it("should receive updates from the tracker when region is being tracked", async () => {
    const arrival = testEventArrival()
    await addTestArrivals(tracker, arrival)
    const callback = jest.fn()
    monitor.monitorRegion(arrival, callback)
    await waitFor(() => expect(callback).toHaveBeenCalledWith(false))
    expect(callback).toHaveBeenCalledTimes(1)

    performArrivalsOperation.mockResolvedValueOnce(
      EventArrivals.fromRegions([arrivalRegion(arrival, true)])
    )
    geofencer.sendUpdate({ ...arrival, hasArrived: true })
    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(true)
    })
    expect(callback).toHaveBeenCalledTimes(2)
    expect(monitor.hasArrivedAtRegion(arrival)).toEqual(true)
  })

  it("should receive updates from foreground when region is removed from tracker", async () => {
    const arrival = testEventArrival()
    await addTestArrivals(tracker, arrival)
    const callback = jest.fn()
    monitor.monitorRegion(arrival, callback)
    await waitFor(() => expect(callback).toHaveBeenCalledWith(false))

    await removeTestArrivals(tracker, arrival.eventId)

    sendForegroundLocationUpdate(arrival.coordinate)
    await waitFor(() => expect(callback).toHaveBeenCalledWith(true))
    expect(callback).toHaveBeenCalledTimes(2)
    expect(monitor.hasArrivedAtRegion(arrival)).toEqual(true)
  })

  it("should filter duplicate updates from tracker", async () => {
    const arrival = testEventArrival()
    await addTestArrivals(tracker, arrival)
    const callback = jest.fn()
    monitor.monitorRegion(arrival, callback)
    await waitFor(() => expect(callback).toHaveBeenCalledWith(false))

    performArrivalsOperation.mockResolvedValue(
      EventArrivals.fromRegions([arrivalRegion(arrival)])
    )
    geofencer.sendUpdate({ ...arrival, hasArrived: false })
    await verifyNeverOccurs(() => {
      expect(callback).toHaveBeenNthCalledWith(2, false)
    })
    expect(monitor.hasArrivedAtRegion(arrival)).toEqual(false)
  })

  it("should monitor regions in the tracker even if they have no subscribers", async () => {
    const coordinate1 = mockLocationCoordinate2D()
    const coordinate2 = {
      latitude: coordinate1.latitude + 0.00001,
      longitude: coordinate1.longitude + 0.00001
    }
    const arrivals = [
      { ...testEventArrival(), coordinate: coordinate1 },
      { ...testEventArrival(), coordinate: coordinate2 }
    ]
    await addTestArrivals(tracker, ...arrivals)
    const callbacks = [jest.fn(), jest.fn()]
    monitor.monitorRegion(arrivals[0], callbacks[0])
    await waitFor(() => expect(callbacks[0]).toHaveBeenCalledWith(false))

    performArrivalsOperation.mockResolvedValueOnce(
      EventArrivals.fromRegions([
        arrivalRegion(arrivals[0], true),
        arrivalRegion(arrivals[1], true)
      ])
    )
    geofencer.sendUpdate({ ...arrivals[0], hasArrived: true })
    await waitFor(() => expect(callbacks[0]).toHaveBeenCalledWith(true))

    monitor.monitorRegion(arrivals[1], callbacks[1])
    await waitFor(() => expect(callbacks[1]).toHaveBeenCalledWith(true))
    expect(callbacks[1]).toHaveBeenCalledTimes(1)
    expect(monitor.hasArrivedAtRegion(arrivals[1])).toEqual(true)
  })

  test("monitor region in tracker, remove from tracker, receive update from foreground, receive update from geofencing", async () => {
    // NB: Add 2 arrivals so that the tracker doesn't stop listenting for
    // geofencing updates when we remove the first arrival.
    const arrivals = [testEventArrival(), testEventArrival()]
    await addTestArrivals(tracker, ...arrivals)

    const callback = jest.fn()
    monitor.monitorRegion(arrivals[0], callback)
    await waitFor(() => expect(callback).toHaveBeenCalledWith(false))

    await removeTestArrivals(tracker, arrivals[0].eventId)

    sendForegroundLocationUpdate(arrivals[0].coordinate)
    await waitFor(() => expect(callback).toHaveBeenCalledWith(true))

    performArrivalsOperation.mockResolvedValueOnce(
      EventArrivals.fromRegions([arrivalRegion(arrivals[0], false)])
    )
    geofencer.sendUpdate({ ...arrivals[1], hasArrived: true })
    await waitFor(() => {
      expect(callback).toHaveBeenNthCalledWith(3, false)
    })
    expect(callback).toHaveBeenCalledTimes(3)
    expect(monitor.hasArrivedAtRegion(arrivals[0])).toEqual(false)
  })

  test("should publish the most recent foreground location update when region removed from tracker", async () => {
    const arrival = testEventArrival()
    await addTestArrivals(tracker, arrival)
    const callback = jest.fn()
    monitor.monitorRegion(arrival, callback)
    await waitFor(() => expect(callback).toHaveBeenCalledWith(false))

    sendForegroundLocationUpdate(arrival.coordinate)

    await removeTestArrivals(tracker, arrival.eventId)
    await waitFor(() => expect(callback).toHaveBeenNthCalledWith(2, true))
    expect(callback).toHaveBeenCalledTimes(2)
    expect(monitor.hasArrivedAtRegion(arrival)).toEqual(true)
  })

  it("should not publish outdated foreground location updates when region removed from tracker", async () => {
    const arrival = testEventArrival()
    await addTestArrivals(tracker, arrival)
    const callback = jest.fn()
    monitor.monitorRegion(arrival, callback)
    await waitFor(() => expect(callback).toHaveBeenCalledWith(false))

    sendForegroundLocationUpdate({
      latitude: arrival.coordinate.latitude + 5,
      longitude: arrival.coordinate.longitude - 5
    })

    performArrivalsOperation.mockResolvedValueOnce(
      EventArrivals.fromRegions([arrivalRegion(arrival, true)])
    )
    geofencer.sendUpdate({ ...arrival, hasArrived: true })
    await waitFor(() => expect(callback).toHaveBeenNthCalledWith(2, true))

    await removeTestArrivals(tracker, arrival.eventId)
    await verifyNeverOccurs(() => {
      expect(callback).toHaveBeenNthCalledWith(3, false)
    })
    expect(callback).toHaveBeenCalledTimes(2)
    expect(monitor.hasArrivedAtRegion(arrival)).toEqual(true)
  })

  it("should not treat foreground location updates as outdated when arrival status is the same in tracker", async () => {
    const arrivals = [testEventArrival(), testEventArrival()]
    await addTestArrivals(tracker, ...arrivals)
    const callbacks = [jest.fn(), jest.fn()]
    monitor.monitorRegion(arrivals[0], callbacks[0])
    monitor.monitorRegion(arrivals[1], callbacks[1])
    await waitFor(() => expect(callbacks[0]).toHaveBeenNthCalledWith(1, false))
    await waitFor(() => expect(callbacks[1]).toHaveBeenNthCalledWith(1, false))

    sendForegroundLocationUpdate(arrivals[0].coordinate)

    performArrivalsOperation.mockResolvedValueOnce(
      EventArrivals.fromRegions([
        arrivalRegion(arrivals[0], false),
        arrivalRegion(arrivals[1], true)
      ])
    )
    geofencer.sendUpdate({ ...arrivals[1], hasArrived: true })
    await waitFor(() => expect(callbacks[1]).toHaveBeenNthCalledWith(2, true))
    expect(monitor.hasArrivedAtRegion(arrivals[0])).toEqual(false)

    await removeTestArrivals(tracker, arrivals[0].eventId)
    await waitFor(() => expect(callbacks[0]).toHaveBeenNthCalledWith(2, true))
    expect(callbacks[0]).toHaveBeenCalledTimes(2)
    expect(monitor.hasArrivedAtRegion(arrivals[0])).toEqual(true)
  })

  test("monitor multiple regions through the tracker", async () => {
    const arrivals = [testEventArrival(), testEventArrival()]
    await addTestArrivals(tracker, ...arrivals)
    const callbacks = [jest.fn(), jest.fn()]
    monitor.monitorRegion(arrivals[0], callbacks[0])
    monitor.monitorRegion(arrivals[1], callbacks[1])
    await waitFor(() => expect(callbacks[0]).toHaveBeenNthCalledWith(1, false))
    await waitFor(() => expect(callbacks[1]).toHaveBeenNthCalledWith(1, false))

    performArrivalsOperation.mockResolvedValueOnce(
      EventArrivals.fromRegions([
        arrivalRegion(arrivals[0], false),
        arrivalRegion(arrivals[1], true)
      ])
    )
    geofencer.sendUpdate({ ...arrivals[1], hasArrived: true })
    await waitFor(() => {
      expect(callbacks[1]).toHaveBeenNthCalledWith(2, true)
    })
    expect(monitor.hasArrivedAtRegion(arrivals[0])).toEqual(false)

    performArrivalsOperation.mockResolvedValueOnce(
      EventArrivals.fromRegions([
        arrivalRegion(arrivals[0], true),
        arrivalRegion(arrivals[1], false)
      ])
    )
    geofencer.sendUpdate({ ...arrivals[0], hasArrived: true })
    await waitFor(() => expect(callbacks[0]).toHaveBeenNthCalledWith(2, true))
    expect(callbacks[1]).toHaveBeenNthCalledWith(3, false)
    expect(monitor.hasArrivedAtRegion(arrivals[0])).toEqual(true)
    expect(monitor.hasArrivedAtRegion(arrivals[1])).toEqual(false)
  })

  it("should not publish updates when unsubscribed", async () => {
    const arrival = testEventArrival()
    await addTestArrivals(tracker, arrival)
    const callback = jest.fn()
    const unsub = monitor.monitorRegion(arrival, callback)
    await waitFor(() => expect(callback).toHaveBeenCalledWith(false))
    unsub()

    performArrivalsOperation.mockResolvedValueOnce(
      EventArrivals.fromRegions([arrivalRegion(arrival, true)])
    )
    geofencer.sendUpdate({ ...arrival, hasArrived: true })
    await verifyNeverOccurs(() => {
      expect(callback).toHaveBeenNthCalledWith(2, true)
    })

    sendForegroundLocationUpdate(arrival.coordinate)
    await removeTestArrivals(tracker, arrival.eventId)
    await verifyNeverOccurs(() => {
      expect(callback).toHaveBeenNthCalledWith(2, true)
    })
  })

  const testEventArrival = () => ({ ...mockEventArrival(), hasArrived: false })
})
