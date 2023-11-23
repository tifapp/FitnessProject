import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  EventArrivalNotification,
  EventArrivalNotificationsSchema
} from "./models"
import { AsyncStorageUtils } from "@lib/AsyncStorage"

/**
 * An interface for storing for pending event arrival notifications.
 */
export interface PendingEventArrivalNotifications {
  /**
   * Loads all pending event arrival notifications.
   */
  all: () => Promise<EventArrivalNotification[]>

  /**
   * Replaces all pending event arrival notifications with the given list
   * of notifications.
   */
  replaceAll: (notifications: EventArrivalNotification[]) => Promise<void>
}

/**
 * {@link PendingEventArrivalNotifications} implemented with {@link AsyncStorage}.
 */
export class AsyncStoragePendingEventArrivalNotifications
implements PendingEventArrivalNotifications {
  private static KEY = "@arrival-notifications"

  async all () {
    return await AsyncStorageUtils.parseJSONItem(
      EventArrivalNotificationsSchema,
      AsyncStoragePendingEventArrivalNotifications.KEY
    ).then((notifications) => notifications ?? [])
  }

  async replaceAll (notifications: EventArrivalNotification[]) {
    await AsyncStorage.setItem(
      AsyncStoragePendingEventArrivalNotifications.KEY,
      JSON.stringify(notifications)
    )
  }
}
