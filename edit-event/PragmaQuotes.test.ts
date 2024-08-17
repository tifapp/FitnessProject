import { createEventQuoteType } from "./PragmaQuotes"

describe("PragmaQuotes tests", () => {
  it.each([
    new Date("2024-08-13T16:47:59"),
    new Date("2024-08-12T12:12:52"),
    new Date("2024-08-11T01:22:35"),
    new Date("2024-08-21T21:38:30")
  ])("Should Return Weekday Quote Type when Current Date is '%s'", (date) => {
    expect(createEventQuoteType(date)).toEqual({ key: "weekday" })
  })

  it.each([
    new Date("2024-08-15T16:47:59"),
    new Date("2024-08-16T12:12:52"),
    new Date("2024-08-17T01:22:35"),
    new Date("2024-08-23T21:38:30")
  ])("Should Return Weekend Quote Type when Current Date is '%s'", (date) => {
    expect(createEventQuoteType(date)).toEqual({ key: "weekend" })
  })

  it.each([
    [new Date("2024-12-22T16:47:59"), "Christmas"],
    [new Date("2024-12-24T12:48:17"), "Christmas"],
    [new Date("2023-12-29T23:28:19"), "New Year's Day"],
    [new Date("2025-02-15T23:28:19"), "Presidents Day"],
    [new Date("2024-02-18T23:28:19"), "Presidents Day"],
    [new Date("2025-05-24T01:22:35"), "Memorial Day"],
    [new Date("2023-05-28T01:22:35"), "Memorial Day"]
  ])(
    "Should Return an Upcoming Holiday Name when Current Date is '%s'",
    (date, holidayName) => {
      expect(createEventQuoteType(date)).toEqual({
        key: "upcomingHoliday",
        name: holidayName
      })
    }
  )

  it.each([
    [new Date("2024-12-25T16:47:59"), "Merry Christmas!"],
    [new Date("2024-01-01T12:48:17"), "Happy New Year!"]
  ])(
    "Should Return a Holiday Greeting when Current Date is '%s'",
    (date, holidayGreeting) => {
      expect(createEventQuoteType(date)).toEqual({
        key: "holiday",
        greeting: holidayGreeting
      })
    }
  )
})
