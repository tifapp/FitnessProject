import { fakeTimers } from "@test-helpers/Timers"
import { EventResponse, EventTimeResponse } from "TiFShared/api/models/Event"
import { clientSideEventFromResponse } from "./ClientSideEvent"

describe("ClientSideEvent tests", () => {
  fakeTimers()

  test("event from response, uses current time as client received time", () => {
    jest.setSystemTime(new Date(10_000))
    const event = clientSideEventFromResponse({
      time: {} as EventTimeResponse
    } as EventResponse)
    expect(event.time.clientReceivedTime).toEqual(new Date(10_000))
  })
})
