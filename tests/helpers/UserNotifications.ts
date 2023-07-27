import { UserNotifications } from "@lib/UserNotifications"

/**
 * A `UserNotifications` instance that causes a test failure when its methods are invoked.
 */
export const unimplementedUserNotifications: UserNotifications = {
  lastNotificationContent: jest.fn()
} as const
