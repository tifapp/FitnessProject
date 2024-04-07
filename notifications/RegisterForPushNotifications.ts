import { DevicePushToken } from "expo-notifications"
import { TiFAPI } from "TiFShared/api"
import { logger } from "TiFShared/logging"

const log = logger("push.notifications.registration")

export const registerForPushNotifications = async (
  token: DevicePushToken,
  tifAPI: TiFAPI = TiFAPI.productionInstance
) => {
  const resp = await tifAPI.registerForPushNotifications(
    token.data,
    token.type === "ios" ? "apple" : "android"
  )
  if (resp.status === 400) {
    log.error("Attempted to register a duplicate push token.")
  }
}
