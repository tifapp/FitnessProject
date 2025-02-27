import { uuidString } from "TiFShared/lib/UUID"
import { TiFAPI } from "TiFShared/api"
import { mockTiFServer } from "TiFShared/test-helpers/mockAPIServer"
import { registerForPushNotifications } from "./RegisterForPushNotifications"

describe("RegisterForPushNotifications tests", () => {
  test("register with iOS token", async () => {
    const pushToken = uuidString()

    mockTiFServer({
      registerForPushNotifications: {
        expectedRequest: { body: { pushToken, platformName: "apple" } },
        mockResponse: { status: 201, data: { status: "inserted" } }
      }
    })

    await registerForPushNotifications(
      { data: pushToken, type: "ios" },
      TiFAPI.testAuthenticatedInstance
    )
  })

  test("register with android token", async () => {
    const pushToken = uuidString()

    mockTiFServer({
      registerForPushNotifications: {
        expectedRequest: { body: { pushToken, platformName: "android" } },
        mockResponse: { status: 201, data: { status: "inserted" } }
      }
    })

    await registerForPushNotifications(
      { data: pushToken, type: "android" },
      TiFAPI.testAuthenticatedInstance
    )
  })
})
