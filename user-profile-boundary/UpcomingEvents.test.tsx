import {
  EventAttendeeMocks,
  EventMocks
} from "@event-details-boundary/MockData"
import { TiFAPI } from "TiFShared/api"
import { mockTiFEndpoint } from "TiFShared/test-helpers/mockAPIServer"
import { userUpcomingEvents } from "./UpcomingEvents"

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
      TiFAPI.testUnauthenticatedInstance
    )
    if (events.status === "success") {
      console.log(JSON.stringify(events.events[0].previewAttendees))
    }
    expect(events).toMatchObject({
      status: "success",
      events: testEvents
    })
  })
  it("gives an error if error code is 403", async () => {
    const testUser = {
      userId: EventAttendeeMocks.Alivs.id,
      error: "blocked-you" as const
    }
    mockTiFEndpoint("upcomingEvents", 403, testUser)
    const events = await userUpcomingEvents(
      EventAttendeeMocks.Alivs.id,
      TiFAPI.testUnauthenticatedInstance
    )
    expect(events.status).toEqual("blocked-you")
  })
})
