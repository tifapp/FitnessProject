import AsyncStorage from "@react-native-async-storage/async-storage"
import { AsyncStorageUpcomingEventArrivals } from "./UpcomingArrivals"
import { EventArrivalsTracker } from "./Tracker"
import { EventArrival, mockEventArrival } from "./models"
import { ArrayUtils } from "@lib/Array"

describe("EventArrivalsTracker tests", () => {
  const upcomingArrivals = new AsyncStorageUpcomingEventArrivals()
  beforeEach(async () => await AsyncStorage.clear())

  const replaceGeofencedCoordinates = jest.fn()
  afterEach(() => replaceGeofencedCoordinates.mockReset())

  const tracker = new EventArrivalsTracker(
    upcomingArrivals,
    replaceGeofencedCoordinates
  )

  test("refresh arrivals", async () => {
    const arrivals = ArrayUtils.repeatElements(2, () => {
      return mockEventArrival()
    })
    await tracker.refreshArrivals(jest.fn().mockResolvedValueOnce(arrivals))
    expect(replaceGeofencedCoordinates).toHaveBeenCalledWith([
      arrivals[0].coordinate,
      arrivals[1].coordinate
    ])
    await expectUpcomingArrivals(arrivals)
  })

  test("track arrival, basic", async () => {
    const arrival = mockEventArrival()
    await tracker.trackArrival(arrival)
    expect(replaceGeofencedCoordinates).toHaveBeenCalledWith([
      arrival.coordinate
    ])
    await expectUpcomingArrivals([arrival])
  })

  test("track arrival, merges with tracked arrivals", async () => {
    const arrivals = ArrayUtils.repeatElements(2, () => {
      return mockEventArrival()
    })
    await tracker.trackArrival(arrivals[0])
    replaceGeofencedCoordinates.mockReset()
    await tracker.trackArrival(arrivals[1])
    expect(replaceGeofencedCoordinates).toHaveBeenCalledWith([
      arrivals[0].coordinate,
      arrivals[1].coordinate
    ])
    await expectUpcomingArrivals(arrivals)
  })

  test("track arrival, updates existing arrival with matching event id", async () => {
    const arrival = mockEventArrival()
    await tracker.trackArrival(arrival)
    replaceGeofencedCoordinates.mockReset()
    const nextArrival = {
      ...mockEventArrival(),
      eventId: arrival.eventId
    }
    await tracker.trackArrival(nextArrival)
    expect(replaceGeofencedCoordinates).toHaveBeenCalledWith([
      nextArrival.coordinate
    ])
    await expectUpcomingArrivals([nextArrival])
  })

  test("remove arrival, basic", async () => {
    const arrivals = ArrayUtils.repeatElements(3, () => {
      return mockEventArrival()
    })
    for (const arrival of arrivals) {
      await tracker.trackArrival(arrival)
    }
    replaceGeofencedCoordinates.mockReset()
    await tracker.removeArrivalByEventId(arrivals[1].eventId)
    expect(replaceGeofencedCoordinates).toHaveBeenCalledWith([
      arrivals[0].coordinate,
      arrivals[2].coordinate
    ])
    await expectUpcomingArrivals([arrivals[0], arrivals[2]])
  })

  test("remove arrival, does nothing when no tracked arrivals", async () => {
    await tracker.removeArrivalByEventId(1)
    expect(replaceGeofencedCoordinates).not.toHaveBeenCalled()
    await expectUpcomingArrivals([])
  })

  test("remove arrival, does nothing when given arrival not tracked", async () => {
    const trackedArrival = { ...mockEventArrival(), eventId: 2 }
    await tracker.trackArrival(trackedArrival)
    replaceGeofencedCoordinates.mockReset()
    await tracker.removeArrivalByEventId(1)
    expect(replaceGeofencedCoordinates).not.toHaveBeenCalled()
    await expectUpcomingArrivals([trackedArrival])
  })

  const expectUpcomingArrivals = async (expected: EventArrival[]) => {
    expect(await upcomingArrivals.all()).toEqual(expected)
  }
})
