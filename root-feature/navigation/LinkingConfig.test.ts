import { UserNotifications } from "notifications/UserNotifications"
import { NotificationContent } from "expo-notifications"
import { unimplementedUserNotifications } from "@test-helpers/UserNotifications"
import { makeLinkingConfig } from "./linkingConfig"

let userNotifications: UserNotifications
let getAppLaunchURL: () => Promise<string | null> = async () => null

const testURL = "tifapp://home"
const testURL2 = "tifapp://profile"

describe("linkingConfig tests", () => {
  beforeEach(() => {
    userNotifications = unimplementedUserNotifications
    getAppLaunchURL = async () => null
  })

  it("should use the app launch url as the initial URL when no notification url", async () => {
    userNotifications.lastNotificationContent = async () => undefined
    getAppLaunchURL = async () => testURL

    const linkingConfig = makeLinkingConfig({
      getAppLaunchURL,
      userNotifications
    })
    expect(await linkingConfig.getInitialURL?.()).toEqual(testURL)
  })

  it("uses a url from the last known notification response as the initial url", async () => {
    userNotifications.lastNotificationContent = async () => {
      return { data: { url: testURL } } as any as NotificationContent
    }
    const linkingConfig = makeLinkingConfig({
      getAppLaunchURL,
      userNotifications
    })
    expect(await linkingConfig.getInitialURL?.()).toEqual(testURL)
  })

  test("initial url is null when no app launch url and undefined notification", async () => {
    userNotifications.lastNotificationContent = async () => undefined
    const linkingConfig = makeLinkingConfig({
      getAppLaunchURL,
      userNotifications
    })
    expect(await linkingConfig.getInitialURL?.()).toBeNull()
  })

  it("should use the notification url over the app launch url", async () => {
    userNotifications.lastNotificationContent = async () => {
      return { data: { url: testURL } } as any as NotificationContent
    }
    getAppLaunchURL = async () => testURL2

    const linkingConfig = makeLinkingConfig({
      getAppLaunchURL,
      userNotifications
    })
    expect(await linkingConfig.getInitialURL?.()).toEqual(testURL)
  })
})
