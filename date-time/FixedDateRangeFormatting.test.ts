import { dateRange, FixedDateRange } from "@date-time"

describe("FixedDateRangeFormatting tests", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2023-02-26T12:00:00"))
  })
  afterEach(() => jest.useRealTimers())

  test("when start date is today, event takes place within the day", () => {
    expectFormattedDateRange(
      dateRange(
        new Date("2023-02-26T17:00:00"),
        new Date("2023-02-26T19:00:00")
      ),
      "Today 5pm - 7pm"
    )
  })

  test("when start date is tomorrow, event takes place within the day", () => {
    expectFormattedDateRange(
      dateRange(
        new Date("2023-02-27T17:00:00"),
        new Date("2023-02-27T19:00:00")
      ),
      "Tomorrow 5pm - 7pm"
    )
  })

  test("event takes place within the day", () => {
    expectFormattedDateRange(
      dateRange(
        new Date("2023-02-24T17:00:00"),
        new Date("2023-02-24T19:00:00")
      ),
      "Feb 24, 5pm - 7pm"
    )
  })

  test("event takes place within the day, am times", () => {
    expectFormattedDateRange(
      dateRange(
        new Date("2023-02-24T10:00:00"),
        new Date("2023-02-24T11:00:00")
      ),
      "Feb 24, 10am - 11am"
    )
  })

  test("event takes place within the day, non-zero minutes", () => {
    expectFormattedDateRange(
      dateRange(
        new Date("2023-02-24T17:30:00"),
        new Date("2023-02-24T19:30:00")
      ),
      "Feb 24, 5:30pm - 7:30pm"
    )
  })

  test("start date is current date, event takes place within the day, non-zero minutes", () => {
    expectFormattedDateRange(
      dateRange(
        new Date("2023-02-26T17:30:00"),
        new Date("2023-02-26T19:30:00")
      ),
      "Today 5:30pm - 7:30pm"
    )
  })

  test("start date is current date, ends the next day, non-zero minutes", () => {
    expectFormattedDateRange(
      dateRange(
        new Date("2023-02-26T17:30:00"),
        new Date("2023-02-27T12:30:00")
      ),
      "Today 5:30pm - Tomorrow 12:30pm"
    )
  })

  test("start date is current date, ends the next day", () => {
    expectFormattedDateRange(
      dateRange(
        new Date("2023-02-26T17:00:00"),
        new Date("2023-02-27T12:00:00")
      ),
      "Today 5pm - Tomorrow 12pm"
    )
  })

  test("ends the next day, non-zero minutes", () => {
    expectFormattedDateRange(
      dateRange(
        new Date("2023-02-23T17:30:00"),
        new Date("2023-02-24T12:30:00")
      ),
      "Feb 23, 5:30pm - Feb 24, 12:30pm"
    )
  })

  test("10 day range, starts today, non-zero minutes, am-pm", () => {
    expectFormattedDateRange(
      dateRange(
        new Date("2023-02-26T07:30:00"),
        new Date("2023-03-08T16:45:00")
      ),
      "Today 7:30am - Mar 8, 4:45pm"
    )
  })

  test("starts today, ends next year, non-zero minutes, am-pm", () => {
    expectFormattedDateRange(
      dateRange(
        new Date("2023-02-26T07:30:00"),
        new Date("2024-03-06T16:45:00")
      ),
      "Today 7:30am - Mar 6 2024, 4:45pm"
    )
  })

  test("starts and ends next year, non-zero minutes, am-pm", () => {
    expectFormattedDateRange(
      dateRange(
        new Date("2024-02-24T07:30:00"),
        new Date("2024-03-06T16:45:00")
      ),
      "Feb 24 2024, 7:30am - Mar 6, 4:45pm"
    )
  })

  test("starts yesterday, pm times", () => {
    expectFormattedDateRange(
      dateRange(
        new Date("2023-02-25T12:00:00"),
        new Date("2023-02-25T15:00:00")
      ),
      "Yesterday 12pm - 3pm"
    )
  })

  test("started 2 days ago, ended yesterday, pm times", () => {
    expectFormattedDateRange(
      dateRange(
        new Date("2023-02-24T12:00:00"),
        new Date("2023-02-25T15:00:00")
      ),
      "Feb 24, 12pm - Yesterday 3pm"
    )
  })

  test("starts today, non-zero minutes less than 10", () => {
    expectFormattedDateRange(
      dateRange(
        new Date("2023-02-26T13:05:00"),
        new Date("2023-02-26T15:05:00")
      ),
      "Today 1:05pm - 3:05pm"
    )
  })

  test("starts today, zero minutes to non-zero minutes", () => {
    expectFormattedDateRange(
      dateRange(
        new Date("2023-02-26T13:00:00"),
        new Date("2023-02-26T15:05:00")
      ),
      "Today 1pm - 3:05pm"
    )
  })

  test("starts and ends in different years", () => {
    expectFormattedDateRange(
      dateRange(
        new Date("2026-02-24T13:00:00"),
        new Date("2027-02-24T15:05:00")
      ),
      "Feb 24 2026, 1pm - Feb 24 2027, 3:05pm"
    )
  })

  test("starts 6 days from today", () => {
    expectFormattedDateRange(
      dateRange(
        new Date("2023-03-04T13:00:00"),
        new Date("2023-03-04T14:00:00")
      ),
      "Sat 1pm - 2pm"
    )
  })

  test("starts 2 days from today, ends 5 days from today", () => {
    expectFormattedDateRange(
      dateRange(
        new Date("2023-02-28T13:00:00"),
        new Date("2023-03-03T14:00:00")
      ),
      "Tue 1pm - Fri 2pm"
    )
  })

  test("starts 1 week from now at time of day before current time of day, am times", () => {
    expectFormattedDateRange(
      dateRange(
        new Date("2023-03-05T08:00:00"),
        new Date("2023-03-05T10:00:00")
      ),
      "Mar 5, 8am - 10am"
    )
  })

  test("ends 1 week from now at time of day before current time of day, am times", () => {
    expectFormattedDateRange(
      dateRange(
        new Date("2023-02-26T08:00:00"),
        new Date("2023-03-05T10:00:00")
      ),
      "Today 8am - Mar 5, 10am"
    )
  })

  test("start and end date are in same minute, today", () => {
    expectFormattedDateRange(
      dateRange(
        new Date("2023-02-26T08:00:32"),
        new Date("2023-02-26T08:00:48")
      ),
      "Today 8am"
    )
  })

  test("start and end date are in same minute, yesterday", () => {
    expectFormattedDateRange(
      dateRange(
        new Date("2023-02-25T08:00:06"),
        new Date("2023-02-25T08:00:42")
      ),
      "Yesterday 8am"
    )
  })

  test("start and end date are in same minute, tomorrow", () => {
    expectFormattedDateRange(
      dateRange(
        new Date("2023-02-27T08:00:11"),
        new Date("2023-02-27T08:00:22")
      ),
      "Tomorrow 8am"
    )
  })

  test("start and end date are in same minute, 2 days from now", () => {
    expectFormattedDateRange(
      dateRange(
        new Date("2023-02-28T08:00:00"),
        new Date("2023-02-28T08:00:00")
      ),
      "Tue 8am"
    )
  })

  test("start and end date are in same minute, 1 month from now", () => {
    expectFormattedDateRange(
      dateRange(
        new Date("2023-03-26T08:00:55"),
        new Date("2023-03-26T08:00:58")
      ),
      "Mar 26, 8am"
    )
  })

  test("start and end date arein same minute, 1 year from now", () => {
    expectFormattedDateRange(
      dateRange(
        new Date("2024-02-26T08:00:30"),
        new Date("2024-02-26T08:00:50")
      ),
      "Feb 26 2024, 8am"
    )
  })
})

const expectFormattedDateRange = (
  dateRange: FixedDateRange,
  expected: string
) => {
  expect(dateRange.formatted()).toEqual(expected)
}
