import Notifications, { NotificationContent } from "expo-notifications";

/**
 * An interface to handle notifications.
 */
export interface UserNotifications {
  lastNotificationContent: () => Promise<
    NotificationContent | null | undefined
  >;
}

/**
 * A `UserNotifications` implementation backed by expo.
 */
export const expoUserNotifications = (): UserNotifications => ({
  lastNotificationContent: async () => {
    return await Notifications.getLastNotificationResponseAsync().then(
      (resp) => resp?.notification.request.content
    );
  },
});
