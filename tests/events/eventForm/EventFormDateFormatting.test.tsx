import { eventFormFormatDateRange } from "@components/eventForm"
import { FixedDateRange } from "@lib/Date"

describe("EventFormDateFormatting tests", () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  test("eventFormFormatDateRange when start date is today, event takes place within the day", () => {
    jest.setSystemTime(new Date("2023-02-26T12:00:00"))
    expect(
      eventFormFormatDateRange(
        new FixedDateRange(
          new Date("2023-02-26T17:00:00"),
          new Date("2023-02-26T19:00:00")
        )
      )
    ).toEqual("Today 5pm - 7pm")
  })
})
