import {
  RestRequest,
  DefaultBodyType,
  PathParams,
  ResponseComposition,
  RestContext,
  rest
} from "msw"
import { TiFAPI } from "../api-client/TiFAPI"
import { mswServer } from "@test-helpers/msw"
import { uuidString } from "@lib/utils/UUID"
import { registerForPushNotifications } from "./RegisterForPushNotifications"

describe("RegisterForPushNotifications tests", () => {
  const createTestBodyHandler = (expectedRequest: {
    pushToken: string
    platformName: "apple" | "android"
  }) => {
    return async (
      req: RestRequest<DefaultBodyType, PathParams<string>>,
      res: ResponseComposition<DefaultBodyType>,
      ctx: RestContext
    ) => {
      expect(await req.json()).toEqual(expectedRequest)
      return res(ctx.status(201), ctx.json({ status: "inserted" }))
    }
  }

  test("register with iOS token", async () => {
    const pushToken = uuidString()
    mswServer.use(
      rest.post(
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
      rest.post(
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
