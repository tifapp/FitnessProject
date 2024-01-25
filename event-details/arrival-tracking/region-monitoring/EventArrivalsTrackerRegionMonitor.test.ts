import { clearAsyncStorageBeforeEach } from "@test-helpers/AsyncStorage"
import { EventArrivalsTracker } from "../Tracker"
import { AsyncStorageUpcomingEventArrivals } from "../UpcomingArrivals"
import { TestEventArrivalsGeofencer } from "../geofencing/TestGeofencer"
import { EventArrivalsTrackerRegionMonitor } from "./EventArrivalsTrackerRegionMonitor"
import { mockEventArrival, mockEventRegion } from "../MockData"
import { ForegroundEventRegionMonitor } from "./ForegroundRegionMonitor"
import { LocationCoordinate2D } from "@shared-models/Location"
import { waitFor } from "@testing-library/react-native"
import { advanceByForegroundMonitorBufferTime } from "./TestHelpers"
import { fakeTimers } from "@test-helpers/Timers"
import { verifyNeverOccurs } from "@test-helpers/ExpectNeverOccurs"
import { mockLocationCoordinate2D } from "@location/MockData"
import { arrivalRegion } from "../Models"

describe("EventArrivalsTrackerRegionMonitor tests", () => {
  clearAsyncStorageBeforeEach()
  const performArrivalsOperation = jest.fn()
  const geofencer = new TestEventArrivalsGeofencer()
  const tracker = new EventArrivalsTracker(
    new AsyncStorageUpcomingEventArrivals(),
    geofencer,
    performArrivalsOperation
  )

  let sendForegroundLocationUpdate: (coordinate: LocationCoordinate2D) => void
  const createForegroundMonitor = () => {
    return new ForegroundEventRegionMonitor(async (callback) => {
      sendForegroundLocationUpdate = callback
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
    advanceByForegroundMonitorBufferTime()
    await waitFor(() => expect(callback).toHaveBeenCalledWith(true))
    expect(monitor.hasArrivedAtRegion(region)).toEqual(true)
  })

  it("should only emit initial arrival status from foreground monitor if region is not in the tracker", async () => {
    const region = mockEventRegion()
    const callback = jest.fn()
    monitor.monitorRegion(region, callback)
    await waitFor(() => expect(callback).toHaveBeenNthCalledWith(1, false))

    sendForegroundLocationUpdate(region.coordinate)
    advanceByForegroundMonitorBufferTime()
    await waitFor(() => expect(callback).toHaveBeenCalledWith(true))

    const callback2 = jest.fn()
    monitor.monitorRegion(region, callback2)
    await waitFor(() => expect(callback2).toHaveBeenCalledWith(true))
    expect(callback2).toHaveBeenCalledTimes(1)
    expect(monitor.hasArrivedAtRegion(region)).toEqual(true)
  })

  it("should filter updates from the foreground monitor when region is in the tracker", async () => {
    const arrival = mockEventArrival()
    await tracker.trackArrival(arrival)
    const callback = jest.fn()
    monitor.monitorRegion(arrival, callback)
    await waitFor(() => expect(callback).toHaveBeenNthCalledWith(1, false))

    sendForegroundLocationUpdate(arrival.coordinate)
    advanceByForegroundMonitorBufferTime()
    await verifyNeverOccurs(() => {
      expect(callback).toHaveBeenCalledWith(true)
    })
    expect(monitor.hasArrivedAtRegion(arrival)).toEqual(false)
  })

  it("should receive updates from the tracker when region is being tracked", async () => {
    const arrival = mockEventArrival()
    await tracker.trackArrival(arrival)
    const callback = jest.fn()
    monitor.monitorRegion(arrival, callback)
    await waitFor(() => expect(callback).toHaveBeenCalledWith(false))
    expect(callback).toHaveBeenCalledTimes(1)

    performArrivalsOperation.mockResolvedValueOnce([
      arrivalRegion(arrival, true)
    ])
    geofencer.sendUpdate({ ...arrival, isArrived: true })
    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(true)
    })
    expect(callback).toHaveBeenCalledTimes(2)
    expect(monitor.hasArrivedAtRegion(arrival)).toEqual(true)
  })

  it("should receive updates from foreground when region is removed from tracker", async () => {
    const arrival = mockEventArrival()
    await tracker.trackArrival(arrival)
    const callback = jest.fn()
    monitor.monitorRegion(arrival, callback)
    await waitFor(() => expect(callback).toHaveBeenCalledWith(false))

    await tracker.removeArrivalByEventId(arrival.eventId)

    sendForegroundLocationUpdate(arrival.coordinate)
    advanceByForegroundMonitorBufferTime()
    await waitFor(() => expect(callback).toHaveBeenCalledWith(true))
    expect(callback).toHaveBeenCalledTimes(2)
    expect(monitor.hasArrivedAtRegion(arrival)).toEqual(true)
  })

  it("should filter duplicate updates from tracker", async () => {
    const arrival = mockEventArrival()
    await tracker.trackArrival(arrival)
    const callback = jest.fn()
    monitor.monitorRegion(arrival, callback)
    await waitFor(() => expect(callback).toHaveBeenCalledWith(false))

    performArrivalsOperation.mockResolvedValue([arrivalRegion(arrival)])
    geofencer.sendUpdate({ ...arrival, isArrived: false })
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
      { ...mockEventArrival(), coordinate: coordinate1 },
      { ...mockEventArrival(), coordinate: coordinate2 }
    ]
    await tracker.trackArrivals(arrivals)
    const callbacks = [jest.fn(), jest.fn()]
    monitor.monitorRegion(arrivals[0], callbacks[0])
    await waitFor(() => expect(callbacks[0]).toHaveBeenCalledWith(false))

    performArrivalsOperation.mockResolvedValueOnce([
      arrivalRegion(arrivals[0], true),
      arrivalRegion(arrivals[1], true)
    ])
    geofencer.sendUpdate({ ...arrivals[0], isArrived: true })
    await waitFor(() => expect(callbacks[0]).toHaveBeenCalledWith(true))

    monitor.monitorRegion(arrivals[1], callbacks[1])
    await waitFor(() => expect(callbacks[1]).toHaveBeenCalledWith(true))
    expect(callbacks[1]).toHaveBeenCalledTimes(1)
    expect(monitor.hasArrivedAtRegion(arrivals[1])).toEqual(true)
  })

  test("monitor region in tracker, remove from tracker, receive update from foreground, receive update from geofencing", async () => {
    // NB: Add 2 arrivals so that the tracker doesn't stop listenting for
    // geofencing updates when we remove the first arrival.
    const arrivals = [mockEventArrival(), mockEventArrival()]
    await tracker.trackArrivals(arrivals)

    const callback = jest.fn()
    monitor.monitorRegion(arrivals[0], callback)
    await waitFor(() => expect(callback).toHaveBeenCalledWith(false))

    await tracker.removeArrivalByEventId(arrivals[0].eventId)

    sendForegroundLocationUpdate(arrivals[0].coordinate)
    advanceByForegroundMonitorBufferTime()
    await waitFor(() => expect(callback).toHaveBeenCalledWith(true))

    performArrivalsOperation.mockResolvedValueOnce([
      arrivalRegion(arrivals[0], false)
    ])
    geofencer.sendUpdate({ ...arrivals[1], isArrived: true })
    await waitFor(() => {
      expect(callback).toHaveBeenNthCalledWith(3, false)
    })
    expect(callback).toHaveBeenCalledTimes(3)
    expect(monitor.hasArrivedAtRegion(arrivals[0])).toEqual(false)
  })

  test("should publish the most recent foreground location update when region removed from tracker", async () => {
    const arrival = mockEventArrival()
    await tracker.trackArrival(arrival)
    const callback = jest.fn()
    monitor.monitorRegion(arrival, callback)
    await waitFor(() => expect(callback).toHaveBeenCalledWith(false))

    sendForegroundLocationUpdate(arrival.coordinate)
    advanceByForegroundMonitorBufferTime()

    await tracker.removeArrivalByEventId(arrival.eventId)
    await waitFor(() => expect(callback).toHaveBeenNthCalledWith(2, true))
    expect(callback).toHaveBeenCalledTimes(2)
    expect(monitor.hasArrivedAtRegion(arrival)).toEqual(true)
  })

  it("should not publish outdated foreground location updates when region removed from tracker", async () => {
    const arrival = mockEventArrival()
    await tracker.trackArrival(arrival)
    const callback = jest.fn()
    monitor.monitorRegion(arrival, callback)
    await waitFor(() => expect(callback).toHaveBeenCalledWith(false))

    sendForegroundLocationUpdate({
      latitude: arrival.coordinate.latitude + 5,
      longitude: arrival.coordinate.longitude - 5
    })
    advanceByForegroundMonitorBufferTime()

    performArrivalsOperation.mockResolvedValueOnce([
      arrivalRegion(arrival, true)
    ])
    geofencer.sendUpdate({ ...arrival, isArrived: true })
    await waitFor(() => expect(callback).toHaveBeenNthCalledWith(2, true))

    await tracker.removeArrivalByEventId(arrival.eventId)
    await verifyNeverOccurs(() => {
      expect(callback).toHaveBeenNthCalledWith(3, false)
    })
    expect(callback).toHaveBeenCalledTimes(2)
    expect(monitor.hasArrivedAtRegion(arrival)).toEqual(true)
  })

  it("should not treat foreground location updates as outdated when arrival status is the same in tracker", async () => {
    const arrivals = [mockEventArrival(), mockEventArrival()]
    await tracker.trackArrivals(arrivals)
    const callbacks = [jest.fn(), jest.fn()]
    monitor.monitorRegion(arrivals[0], callbacks[0])
    monitor.monitorRegion(arrivals[1], callbacks[1])
    await waitFor(() => expect(callbacks[0]).toHaveBeenNthCalledWith(1, false))
    await waitFor(() => expect(callbacks[1]).toHaveBeenNthCalledWith(1, false))

    sendForegroundLocationUpdate(arrivals[0].coordinate)
    advanceByForegroundMonitorBufferTime()

    performArrivalsOperation.mockResolvedValueOnce([
      arrivalRegion(arrivals[0], false),
      arrivalRegion(arrivals[1], true)
    ])
    geofencer.sendUpdate({ ...arrivals[1], isArrived: true })
    await waitFor(() => expect(callbacks[1]).toHaveBeenNthCalledWith(2, true))
    expect(monitor.hasArrivedAtRegion(arrivals[0])).toEqual(false)

    await tracker.removeArrivalByEventId(arrivals[0].eventId)
    await waitFor(() => expect(callbacks[0]).toHaveBeenNthCalledWith(2, true))
    expect(callbacks[0]).toHaveBeenCalledTimes(2)
    expect(monitor.hasArrivedAtRegion(arrivals[0])).toEqual(true)
  })

  test("monitor multiple regions through the tracker", async () => {
    const arrivals = [mockEventArrival(), mockEventArrival()]
    await tracker.trackArrivals(arrivals)
    const callbacks = [jest.fn(), jest.fn()]
    monitor.monitorRegion(arrivals[0], callbacks[0])
    monitor.monitorRegion(arrivals[1], callbacks[1])
    await waitFor(() => expect(callbacks[0]).toHaveBeenNthCalledWith(1, false))
    await waitFor(() => expect(callbacks[1]).toHaveBeenNthCalledWith(1, false))

    performArrivalsOperation.mockResolvedValueOnce([
      arrivalRegion(arrivals[0], false),
      arrivalRegion(arrivals[1], true)
    ])
    geofencer.sendUpdate({ ...arrivals[1], isArrived: true })
    await waitFor(() => {
      expect(callbacks[1]).toHaveBeenNthCalledWith(2, true)
    })
    expect(monitor.hasArrivedAtRegion(arrivals[0])).toEqual(false)

    performArrivalsOperation.mockResolvedValueOnce([
      arrivalRegion(arrivals[0], true),
      arrivalRegion(arrivals[1], false)
    ])
    geofencer.sendUpdate({ ...arrivals[0], isArrived: true })
    await waitFor(() => expect(callbacks[0]).toHaveBeenNthCalledWith(2, true))
    expect(callbacks[1]).toHaveBeenNthCalledWith(3, false)
    expect(monitor.hasArrivedAtRegion(arrivals[0])).toEqual(true)
    expect(monitor.hasArrivedAtRegion(arrivals[1])).toEqual(false)
  })

  it("should not publish updates when unsubscribed", async () => {
    const arrival = mockEventArrival()
    await tracker.trackArrival(arrival)
    const callback = jest.fn()
    const unsub = monitor.monitorRegion(arrival, callback)
    await waitFor(() => expect(callback).toHaveBeenCalledWith(false))
    unsub()

    performArrivalsOperation.mockResolvedValueOnce([
      arrivalRegion(arrival, true)
    ])
    geofencer.sendUpdate({ ...arrival, isArrived: true })
    await verifyNeverOccurs(() => {
      expect(callback).toHaveBeenNthCalledWith(2, true)
    })

    sendForegroundLocationUpdate(arrival.coordinate)
    advanceByForegroundMonitorBufferTime()
    await tracker.removeArrivalByEventId(arrival.eventId)
    await verifyNeverOccurs(() => {
      expect(callback).toHaveBeenNthCalledWith(2, true)
    })
  })
})
