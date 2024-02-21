import { uuidString } from "@lib/utils/UUID"
import { mswServer } from "@test-helpers/msw"
import {
  DefaultBodyType,
  HttpResponse,
  StrictRequest,
  http
} from "msw"
import { TiFAPI } from "../api-client/TiFAPI"
import { registerForPushNotifications } from "./RegisterForPushNotifications"

describe("RegisterForPushNotifications tests", () => {
  const createTestBodyHandler = (expectedRequest: {
    pushToken: string
    platformName: "apple" | "android"
  }) => {
    return async (
      { request }: {request: StrictRequest<DefaultBodyType>}
    ) => {
      expect(await request.json()).toEqual(expectedRequest)
      return HttpResponse.json({ status: "inserted" }, { status: 201 })
    }
  }

  test("register with iOS token", async () => {
    const pushToken = uuidString()
    mswServer.use(
      http.post(
        TiFAPI.testPath("/user/notifications/push/register"),
        createTestBodyHandler({ pushToken, platformName: "apple" })
      )
    )
    await registerForPushNotifications(
      { data: pushToken, type: "ios" },
      TiFAPI.testAuthenticatedInstance
    )
  })

  test("register with android token", async () => {
    const pushToken = uuidString()
    mswServer.use(
      http.post(
        TiFAPI.testPath("/user/notifications/push/register"),
        createTestBodyHandler({ pushToken, platformName: "android" })
      )
    )
    await registerForPushNotifications(
      { data: pushToken, type: "android" },
      TiFAPI.testAuthenticatedInstance
    )
  })
})
