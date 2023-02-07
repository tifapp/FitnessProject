import Notifications, { NotificationContent } from "expo-notifications";

/**
 * An interface to handle notifications.
 */
export interface UserNotifications {
  /**
   * Returns the content from the last notification the user tapped on
   * from outside the app.
   */
  lastNotificationContent: () => Promise<
    NotificationContent | null | undefined
  >;
}

/**
 * A `UserNotifications` implementation backed by expo.
 */
export class ExpoUserNotifications implements UserNotifications {
  async lastNotificationContent() {
    return await Notifications.getLastNotificationResponseAsync().then(
      (resp) => resp?.notification.request.content
    );
  }
}
