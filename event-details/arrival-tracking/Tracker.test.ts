import AsyncStorage from "@react-native-async-storage/async-storage"
import { AsyncStoragePendingEventArrivalNotifications } from "./PendingNotifications"
import { EventArrivalsTracker } from "./Tracker"
import {
  EventArrivalNotification,
  mockEventArrivalNotification
} from "./models"
import { ArrayUtils } from "@lib/Array"

describe("EventArrivalsTracker tests", () => {
  const pendingNotifications =
    new AsyncStoragePendingEventArrivalNotifications()
  beforeEach(async () => await AsyncStorage.clear())

  const replaceGeofencedCoordinates = jest.fn()
  afterEach(() => replaceGeofencedCoordinates.mockReset())

  const tracker = new EventArrivalsTracker(
    pendingNotifications,
    replaceGeofencedCoordinates
  )

  test("refresh upcoming arrivals", async () => {
    const upcomingArrivals = ArrayUtils.repeatElements(2, () => {
      return mockEventArrivalNotification()
    })
    await tracker.refreshUpcomingArrivalNotifications(
      jest.fn().mockResolvedValueOnce(upcomingArrivals)
    )
    expect(replaceGeofencedCoordinates).toHaveBeenCalledWith([
      upcomingArrivals[0].coordinate,
      upcomingArrivals[1].coordinate
    ])
    await expectPendingNotifications(upcomingArrivals)
  })

  test("add upcoming arrival, basic", async () => {
    const arrivalNotification = mockEventArrivalNotification()
    await tracker.addUpcomingArrivalNotification(arrivalNotification)
    expect(replaceGeofencedCoordinates).toHaveBeenCalledWith([
      arrivalNotification.coordinate
    ])
    await expectPendingNotifications([arrivalNotification])
  })

  test("add upcoming arrival, merges with tracked arrivals", async () => {
    const notifications = ArrayUtils.repeatElements(2, () => {
      return mockEventArrivalNotification()
    })
    await tracker.addUpcomingArrivalNotification(notifications[0])
    replaceGeofencedCoordinates.mockReset()
    await tracker.addUpcomingArrivalNotification(notifications[1])
    expect(replaceGeofencedCoordinates).toHaveBeenCalledWith([
      notifications[0].coordinate,
      notifications[1].coordinate
    ])
    await expectPendingNotifications(notifications)
  })

  test("add upcoming arrival, updates existing arrival with matching event id", async () => {
    const arrivalNotification = mockEventArrivalNotification()
    await tracker.addUpcomingArrivalNotification(arrivalNotification)
    replaceGeofencedCoordinates.mockReset()
    const nextArrival = {
      ...mockEventArrivalNotification(),
      eventId: arrivalNotification.eventId
    }
    await tracker.addUpcomingArrivalNotification(nextArrival)
    expect(replaceGeofencedCoordinates).toHaveBeenCalledWith([
      nextArrival.coordinate
    ])
    await expectPendingNotifications([nextArrival])
  })

  test("remove upcoming arrival, basic", async () => {
    const arrivals = ArrayUtils.repeatElements(3, () => {
      return mockEventArrivalNotification()
    })
    for (const arrival of arrivals) {
      await tracker.addUpcomingArrivalNotification(arrival)
    }
    replaceGeofencedCoordinates.mockReset()
    await tracker.removeUpcomingArrivalNotificationByEventId(
      arrivals[1].eventId
    )
    expect(replaceGeofencedCoordinates).toHaveBeenCalledWith([
      arrivals[0].coordinate,
      arrivals[2].coordinate
    ])
    await expectPendingNotifications([arrivals[0], arrivals[2]])
  })

  test("remove upcoming arrival, does nothing when no tracked arrivals", async () => {
    await tracker.removeUpcomingArrivalNotificationByEventId(1)
    expect(replaceGeofencedCoordinates).not.toHaveBeenCalled()
    await expectPendingNotifications([])
  })

  test("remove upcoming arrival, does nothing when given arrival not tracked", async () => {
    const trackedArrival = { ...mockEventArrivalNotification(), eventId: 2 }
    await tracker.addUpcomingArrivalNotification(trackedArrival)
    replaceGeofencedCoordinates.mockReset()
    await tracker.removeUpcomingArrivalNotificationByEventId(1)
    expect(replaceGeofencedCoordinates).not.toHaveBeenCalled()
    await expectPendingNotifications([trackedArrival])
  })

  const expectPendingNotifications = async (
    expected: EventArrivalNotification[]
  ) => {
    const allPending = await pendingNotifications.all()
    expect(allPending).toEqual(expected)
  }
})
