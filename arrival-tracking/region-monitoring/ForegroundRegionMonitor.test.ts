import { verifyNeverOccurs } from "@test-helpers/ExpectNeverOccurs"
import { fakeTimers } from "@test-helpers/Timers"
import { waitFor } from "@testing-library/react-native"
import { mockEventRegion } from "../MockData"
import { ForegroundEventRegionMonitor } from "./ForegroundRegionMonitor"
import { repeatElements } from "TiFShared/lib/Array"
import { LocationCoordinate2D } from "TiFShared/domain-models/LocationCoordinate2D"

describe("ForegroundEventRegionMonitor tests", () => {
  const TEST_REGION = {
    coordinate: {
      latitude: 45.00000000000001,
      longitude: -121.00000000000001
    },
    arrivalRadiusMeters: 200
  }

  let sendLocationUpdate: (coordinate: LocationCoordinate2D) => void
  const unsubscribe = jest.fn()
  const createMonitor = () => {
    return new ForegroundEventRegionMonitor(async (callback) => {
      sendLocationUpdate = callback
      return { remove: unsubscribe }
    })
  }

  let monitor = createMonitor()
  fakeTimers()
  beforeEach(() => {
    monitor = createMonitor()
    jest.resetAllMocks()
  })

  it("should return false for arriving in an unmonitored region", () => {
    expect(monitor.hasArrivedAtRegion(mockEventRegion())).toEqual(false)
  })

  it("should emit false when no user location known", () => {
    const region = mockEventRegion()
    const callback = jest.fn()
    monitor.monitorRegion(region, callback)
    expect(callback).toHaveBeenCalledWith(false)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(monitor.hasArrivedAtRegion(region)).toEqual(false)
  })

  it("should emit true when user location is within the distance of newly monitored region", async () => {
    const callback = jest.fn()
    monitor.monitorRegion(TEST_REGION, callback)
    sendLocationUpdate({ latitude: 45.0, longitude: -121.0 })
    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(true)
    })
    expect(monitor.hasArrivedAtRegion(TEST_REGION)).toEqual(true)
  })

  test("enter and leave region, emits false after leaving", async () => {
    const callback = jest.fn()
    monitor.monitorRegion(TEST_REGION, callback)
    sendLocationUpdate({ latitude: 45.0, longitude: -121.0 })
    await waitFor(() => expect(callback).toHaveBeenCalledWith(true))

    sendLocationUpdate({ latitude: 57.0, longitude: 42.0 })
    await waitFor(() => expect(callback).toHaveBeenCalledWith(false))
    expect(monitor.hasArrivedAtRegion(TEST_REGION)).toEqual(false)
  })

  it("should filter duplicate updates", async () => {
    const callback = jest.fn()
    monitor.monitorRegion(TEST_REGION, callback)
    sendLocationUpdate(TEST_REGION.coordinate)
    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(true)
    })
    expect(monitor.hasArrivedAtRegion(TEST_REGION)).toEqual(true)

    sendLocationUpdate(TEST_REGION.coordinate)
    await verifyNeverOccurs(() => expect(callback).toHaveBeenCalledTimes(3))
  })

  it("should not send updates when unsubscribed", async () => {
    const callback = jest.fn()
    const unsub = monitor.monitorRegion(TEST_REGION, callback)
    unsub()
    sendLocationUpdate(TEST_REGION.coordinate)
    await verifyNeverOccurs(() => expect(callback).toHaveBeenCalledWith(true))
  })

  it("should reuse the previous state from the last time there was a state update for the region", async () => {
    const callback = jest.fn()
    const unsub = monitor.monitorRegion(TEST_REGION, callback)
    sendLocationUpdate(TEST_REGION.coordinate)
    await waitFor(() => expect(callback).toHaveBeenCalledWith(true))
    unsub()
    callback.mockReset()
    monitor.monitorRegion(TEST_REGION, callback)
    await waitFor(() => expect(callback).toHaveBeenCalledWith(true))
  })

  it("should update multiple subscribers for the same region", async () => {
    const callbacks = repeatElements(10, () => jest.fn())
    callbacks.forEach((callback) => {
      monitor.monitorRegion(TEST_REGION, callback)
      callback.mockReset()
    })
    sendLocationUpdate(TEST_REGION.coordinate)
    await Promise.allSettled(
      callbacks.map(async (callback) => {
        await waitFor(() => expect(callback).toHaveBeenCalledWith(true))
        expect(callback).toHaveBeenCalledTimes(1)
      })
    )
  })

  it("should estimate the initial arrival status based on the user's location updating from monitoring another active region", async () => {
    const testRegion2 = {
      ...TEST_REGION,
      coordinate: {
        latitude: TEST_REGION.coordinate.latitude + 0.000000001,
        longitude: TEST_REGION.coordinate.longitude + 0.000000001
      }
    }
    monitor.monitorRegion(TEST_REGION, jest.fn())
    sendLocationUpdate(TEST_REGION.coordinate)
    expect(monitor.hasArrivedAtRegion(testRegion2)).toEqual(true)
    const callback = jest.fn()
    monitor.monitorRegion(testRegion2, callback)
    expect(callback).toHaveBeenCalledWith(true)
  })

  it("should be able to monitor multiple different regions at once", async () => {
    const testRegion2 = mockEventRegion()
    const callbacks = [jest.fn(), jest.fn()]
    const unsub1 = monitor.monitorRegion(TEST_REGION, callbacks[0])
    expect(callbacks[0]).toHaveBeenCalledWith(false)
    expect(monitor.hasArrivedAtRegion(TEST_REGION)).toEqual(false)

    monitor.monitorRegion(testRegion2, callbacks[1])
    expect(callbacks[1]).toHaveBeenCalledWith(false)
    expect(monitor.hasArrivedAtRegion(testRegion2)).toEqual(false)

    sendLocationUpdate(testRegion2.coordinate)
    expect(callbacks[1]).toHaveBeenNthCalledWith(2, true)
    expect(callbacks[1]).toHaveBeenCalledTimes(2)
    expect(callbacks[0]).toHaveBeenCalledTimes(1)

    unsub1()
    sendLocationUpdate(TEST_REGION.coordinate)
    expect(callbacks[0]).toHaveBeenCalledTimes(1)
    expect(callbacks[1]).toHaveBeenNthCalledWith(3, false)
    expect(callbacks[1]).toHaveBeenCalledTimes(3)
  })

  it("should unsubscribe from the location watcher when no regions subscribed to", async () => {
    const unsub = monitor.monitorRegion(TEST_REGION, jest.fn())
    unsub()
    await waitFor(() => expect(unsubscribe).toHaveBeenCalledTimes(1))
  })
})
