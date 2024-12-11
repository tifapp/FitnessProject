import { EventMocks } from "@event-details-boundary/MockData"
import { dateRange } from "TiFShared/domain-models/FixedDateRange"
import { clientSideEventFromResponse } from "./ClientSideEvent"
import { editFormValues } from "./EditFormValues"

describe("EditEventFormValues tests", () => {
  it("should compute the duration from the date range", () => {
    const now = new Date()
    const event = clientSideEventFromResponse({
      ...EventMocks.MockSingleAttendeeResponse,
      time: {
        ...EventMocks.MockSingleAttendeeResponse.time,
        dateRange: dateRange(now, now.ext.addSeconds(60))!
      }
    })
    expect(editFormValues(event).duration).toEqual(60)
  })
})
