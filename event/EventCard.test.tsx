import { eventCardFormattedDateRange } from "./EventCard"
import "@test-helpers/Matchers"
import { EventMocks } from "@event-details-boundary/MockData"

describe("EventCard tests", () => {
  it("formats the date range correctly", () => {
    expect(
      eventCardFormattedDateRange(EventMocks.PickupBasketball.time.dateRange)
    ).toEqual("Saturday, 12:00-1:00 PM")
  })
})
