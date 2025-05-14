import {
  EventAttendeeMocks,
  EventMocks
} from "@event-details-boundary/MockData"
import { mockPlacemark } from "@location/MockData"
import { TiFAPI } from "TiFShared/api"
import { mockTiFEndpoint } from "TiFShared/test-helpers/mockAPIServer"
import { userUpcomingEvents } from "./Context"

describe("fetchUpcomingEvents tests", () => {
  it("loads upcoming events for current user", async () => {
    const testUser = {
      id: EventAttendeeMocks.Alivs.id,
      name: EventAttendeeMocks.Alivs.name,
      handle: EventAttendeeMocks.Alivs.handle,
      relationStatus: "not-friends" as const
    }
    const testEvents = [
      {
        ...EventMocks.MockSingleAttendeeResponse,
        id: 2,
        location: {
          ...EventMocks.MockSingleAttendeeResponse.location,
          placemark: mockPlacemark()
        },
        previewAttendees: [
          {
            ...testUser,
            role: "hosting" as const,
            hasArrived: true,
            joinedDateTime: new Date()
          }
        ]
      }
    ]
    mockTiFEndpoint("upcomingEvents", 200, { events: testEvents })
    const events = await userUpcomingEvents(
      testUser.id,
      TiFAPI.testAuthenticatedInstance
    )
    expect(events).toMatchObject({ status: "success", events: testEvents })
  })
  it("gives an error if error code is 403", async () => {
    const testUser = {
      userId: EventAttendeeMocks.Alivs.id,
      error: "blocked-you" as const
    }
    mockTiFEndpoint("upcomingEvents", 403, testUser)
    const events = await userUpcomingEvents(
      EventAttendeeMocks.Alivs.id,
      TiFAPI.testAuthenticatedInstance
    )
    expect(events.status).toEqual("blocked-you")
  })
})
