import { LocationCoordinate2D } from "@lib/location"
import { PendingEventArrivalNotifications } from "./PendingNotifications"
import { EventArrivalNotification } from "./models"

/**
 * A class for tracking upcoming event arrivals.
 *
 * This class acts as a proxy that ensures that all pending arrival notifications
 * also have their coordinates being geofenced simulataneously, and keeps those
 * sources in sync on a consistent basis.
 */
export class EventArrivalsTracker {
  private readonly pendingArrivalNotifications: PendingEventArrivalNotifications
  private readonly replaceGeofencedCoordinates: (
    events: LocationCoordinate2D[]
  ) => void

  constructor (
    pendingArrivalNotifications: PendingEventArrivalNotifications,
    replaceGeofencedCoordinates: (coordinates: LocationCoordinate2D[]) => void
  ) {
    this.pendingArrivalNotifications = pendingArrivalNotifications
    this.replaceGeofencedCoordinates = replaceGeofencedCoordinates
  }

  /**
   * Refreshes the upcoming arrival notifications.
   *
   * @param fetchUpcomingNotifications a function to fetch the upcoming {@link EventArrivalNotification}s.
   */
  async refreshUpcomingArrivalNotifications (
    fetchUpcomingNotifications: () => Promise<EventArrivalNotification[]>
  ) {
    await this.syncArrivalNotifications(await fetchUpcomingNotifications())
  }

  /**
   * Adds an {@link EventArrivalNotification} to tracking.
   *
   * If a notification exists with the same event id, then that notification
   * is updated without a new one being added.
   */
  async addUpcomingArrivalNotification (notification: EventArrivalNotification) {
    const currentNotifications = await this.pendingArrivalNotifications.all()
    const eventIdIndex = currentNotifications.findIndex(
      (innerNotification) => innerNotification.eventId === notification.eventId
    )
    if (eventIdIndex >= 0) {
      currentNotifications[eventIdIndex] = notification
    } else {
      currentNotifications.push(notification)
    }
    await this.syncArrivalNotifications(currentNotifications)
  }

  async removeUpcomingArrivalNotificationByEventId (eventId: number) {
    const currentNotifications = await this.pendingArrivalNotifications.all()
    const filteredNotifications = currentNotifications.filter(
      (notification) => notification.eventId !== eventId
    )
    if (currentNotifications.length === filteredNotifications.length) return
    await this.syncArrivalNotifications(filteredNotifications)
  }

  private async syncArrivalNotifications (
    notifications: EventArrivalNotification[]
  ) {
    this.replaceGeofencedCoordinates(
      notifications.map((notification) => notification.coordinate)
    )
    await this.pendingArrivalNotifications.replaceAll(notifications)
  }
}
