import { EventMocks } from "@event-details-boundary/MockData"
import { dateRange } from "TiFShared/domain-models/FixedDateRange"
import { clientSideEventFromResponse } from "./ClientSideEvent"
import {
  editFormValues,
  fromRouteableEditFormValues,
  toRouteableEditFormValues
} from "./EditFormValues"

describe("EditEventFormValues tests", () => {
  const now = new Date()
  const TEST_EVENT = clientSideEventFromResponse({
    ...EventMocks.MockSingleAttendeeResponse,
    time: {
      ...EventMocks.MockSingleAttendeeResponse.time,
      dateRange: dateRange(now, now.ext.addSeconds(60))!
    }
  })
  it("should compute the duration from the date range", () => {
    expect(editFormValues(TEST_EVENT).duration).toEqual(60)
  })

  it("should be able to convert to and from routeable values", () => {
    const formValues = editFormValues(TEST_EVENT)
    expect(
      fromRouteableEditFormValues(toRouteableEditFormValues(formValues))
    ).toEqual(formValues)
  })
})
