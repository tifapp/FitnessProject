import AsyncStorage from "@react-native-async-storage/async-storage"
import { AsyncStorageUpcomingEventArrivals } from "./UpcomingArrivals"
import { EventArrivalsTracker } from "./Tracker"
import { EventArrival, EventArrivalOperationResult } from "./Models"
import { ArrayUtils } from "@lib/Array"
import { LocationCoordinate2D } from "@location"
import {
  EventArrivalGeofencingCallback,
  EventArrivalGeofencingUpdate,
  EventArrivalsGeofencer
} from "./Geofencing"
import { waitFor } from "@testing-library/react-native"
import { mockLocationCoordinate2D } from "@location/MockData"
import { mockEventArrival } from "./MockData"

class TestGeofencer implements EventArrivalsGeofencer {
  private updateCallback?: EventArrivalGeofencingCallback
  geofencedCoordinates = [] as LocationCoordinate2D[]

  get hasSubscriber () {
    return !!this.updateCallback
  }

  async replaceGeofencedCoordinates (coordinates: LocationCoordinate2D[]) {
    this.geofencedCoordinates = coordinates
  }

  sendUpdate (update: EventArrivalGeofencingUpdate) {
    this.updateCallback?.(update)
  }

  reset () {
    this.updateCallback = undefined
    this.geofencedCoordinates = []
  }

  onUpdate (handleUpdate: EventArrivalGeofencingCallback) {
    this.updateCallback = handleUpdate
    return () => {
      this.updateCallback = undefined
    }
  }
}

describe("EventArrivalsTracker tests", () => {
  const upcomingArrivals = new AsyncStorageUpcomingEventArrivals()
  beforeEach(async () => await AsyncStorage.clear())

  const testGeofencer = new TestGeofencer()

  const replaceGeofencedCoordinates = jest.fn()
  const performArrivalOperation = jest.fn()
  beforeEach(() => testGeofencer.reset())
  afterEach(() => {
    replaceGeofencedCoordinates.mockReset()
    performArrivalOperation.mockReset()
  })

  const tracker = new EventArrivalsTracker(
    upcomingArrivals,
    testGeofencer,
    performArrivalOperation
  )

  test("refresh arrivals", async () => {
    const arrivals = ArrayUtils.repeatElements(2, () => {
      return mockEventArrival()
    })
    await tracker.refreshArrivals(jest.fn().mockResolvedValueOnce(arrivals))
    expectGeofencedCoordinates([arrivals[0].coordinate, arrivals[1].coordinate])
    await expectUpcomingArrivals(arrivals)
  })

  test("track arrival, basic", async () => {
    const arrival = mockEventArrival()
    await tracker.trackArrival(arrival)
    expectGeofencedCoordinates([arrival.coordinate])
    await expectUpcomingArrivals([arrival])
  })

  test("track arrival, merges with tracked arrivals", async () => {
    const arrivals = ArrayUtils.repeatElements(2, () => {
      return mockEventArrival()
    })
    await tracker.trackArrival(arrivals[0])
    await tracker.trackArrival(arrivals[1])
    expectGeofencedCoordinates([arrivals[0].coordinate, arrivals[1].coordinate])
    await expectUpcomingArrivals(arrivals)
  })

  test("track arrival, updates existing arrival with matching event id", async () => {
    const arrival = mockEventArrival()
    await tracker.trackArrival(arrival)
    const nextArrival = {
      ...mockEventArrival(),
      eventId: arrival.eventId
    }
    await tracker.trackArrival(nextArrival)
    expectGeofencedCoordinates([nextArrival.coordinate])
    await expectUpcomingArrivals([nextArrival])
  })

  test("remove arrival, basic", async () => {
    const arrivals = ArrayUtils.repeatElements(3, () => {
      return mockEventArrival()
    })
    await tracker.trackArrivals(arrivals)
    await tracker.removeArrivalByEventId(arrivals[1].eventId)
    expectGeofencedCoordinates([arrivals[0].coordinate, arrivals[2].coordinate])
    await expectUpcomingArrivals([arrivals[0], arrivals[2]])
  })

  test("remove arrival, does nothing when no tracked arrivals", async () => {
    await tracker.removeArrivalByEventId(1)
    expectGeofencedCoordinates([])
    await expectUpcomingArrivals([])
  })

  test("remove arrival, does nothing when given arrival not tracked", async () => {
    const trackedArrival = { ...mockEventArrival(), eventId: 2 }
    await tracker.trackArrival(trackedArrival)
    await tracker.removeArrivalByEventId(1)
    expectGeofencedCoordinates([trackedArrival.coordinate])
    await expectUpcomingArrivals([trackedArrival])
  })

  test("does not subscribe to geofencing updates when no tracked arrivals", async () => {
    await tracker.startTracking()
    expect(testGeofencer.hasSubscriber).toEqual(false)
  })

  test("subscribes to geofencing updates when previously tracked arrivals", async () => {
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

  test("handle geofencing update, no tracked arrival at coordinate, does not perform arrival operation", async () => {
    await tracker.trackArrival(mockEventArrival())
    testGeofencer.sendUpdate({
      coordinate: mockLocationCoordinate2D(),
      status: "entered"
    })
    expect(performArrivalOperation).not.toHaveBeenCalled()
  })

  test("handle geofencing update, all successful operations, does \"arrived\" operation for all arrivals when entering coordinate", async () => {
    const coordinate = mockLocationCoordinate2D()
    const arrivals = ArrayUtils.repeatElements(3, () => {
      return { ...mockEventArrival(), coordinate }
    })
    performArrivalOperation.mockResolvedValueOnce(
      arrivals.map(successResultForArrival)
    )
    await tracker.trackArrivals(arrivals)
    testGeofencer.sendUpdate({ coordinate, status: "entered" })
    await waitFor(() => {
      expect(performArrivalOperation).toHaveBeenCalledWith(arrivals, "arrived")
    })
  })

  test("handle geofencing update, all successful operations, does \"departed\" operation for all arrivals when exiting coordinate", async () => {
    const coordinate = mockLocationCoordinate2D()
    const arrivals = ArrayUtils.repeatElements(3, () => {
      return { ...mockEventArrival(), coordinate }
    })
    performArrivalOperation.mockResolvedValueOnce(
      arrivals.map(successResultForArrival)
    )
    await tracker.trackArrivals(arrivals)
    testGeofencer.sendUpdate({ coordinate, status: "exited" })
    await waitFor(() => {
      expect(performArrivalOperation).toHaveBeenCalledWith(arrivals, "departed")
    })
  })

  test("handle geofencing update, removes arrivals with a \"non-upcoming\" operation result status", async () => {
    const coordinate = mockLocationCoordinate2D()
    const arrivals = ArrayUtils.repeatElements(3, () => {
      return { ...mockEventArrival(), coordinate }
    })
    const operationResults = arrivals.map(successResultForArrival)
    operationResults[1] = {
      eventId: operationResults[1].eventId,
      status: "non-upcoming"
    }
    performArrivalOperation.mockResolvedValueOnce(operationResults)
    await tracker.trackArrivals(arrivals)
    testGeofencer.sendUpdate({ coordinate, status: "entered" })
    await waitFor(() => {
      expectGeofencedCoordinates([
        arrivals[0].coordinate,
        arrivals[2].coordinate
      ])
    })
    await expectUpcomingArrivals([arrivals[0], arrivals[2]])
  })

  test("handle geofencing update, updates arrivals with an \"outdated-coordinate\" operation result status", async () => {
    const coordinate = mockLocationCoordinate2D()
    const arrivals = ArrayUtils.repeatElements(3, () => {
      return { ...mockEventArrival(), coordinate }
    })
    const operationResults = arrivals.map(successResultForArrival)
    const updatedCoordinate = mockLocationCoordinate2D()
    operationResults[1] = {
      eventId: operationResults[1].eventId,
      status: "outdated-coordinate",
      updatedCoordinate
    }
    performArrivalOperation.mockResolvedValueOnce(operationResults)
    await tracker.trackArrivals(arrivals)
    testGeofencer.sendUpdate({ coordinate, status: "entered" })
    await waitFor(() => {
      expectGeofencedCoordinates([
        arrivals[0].coordinate,
        updatedCoordinate,
        arrivals[2].coordinate
      ])
    })
    await expectUpcomingArrivals([
      arrivals[0],
      { ...arrivals[1], coordinate: updatedCoordinate },
      arrivals[2]
    ])
  })

  const successResultForArrival = (
    arrival: EventArrival
  ): EventArrivalOperationResult => ({
    eventId: arrival.eventId,
    status: "success"
  })

  const expectUpcomingArrivals = async (expected: EventArrival[]) => {
    expect(await upcomingArrivals.all()).toEqual(expected)
  }

  const expectGeofencedCoordinates = (expected: LocationCoordinate2D[]) => {
    expect(testGeofencer.geofencedCoordinates).toEqual(expected)
  }
})
