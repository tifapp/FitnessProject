import { UserNotifications } from "@lib/UserNotifications"
import { unimplemented } from "./unimplemented"

/**
 * A `UserNotifications` instance that causes a test failure when its methods are invoked.
 */
export const unimplementedUserNotifications: UserNotifications = {
  lastNotificationContent: () => unimplemented("lastNotificationResponse")
} as const
