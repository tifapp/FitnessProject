import { fakeTimers } from "@test-helpers/Timers"
import { PragmaQuoteView, createEventQuoteType } from "./PragmaQuotes"
import { act, render, screen, waitFor } from "@testing-library/react-native"
import "@test-helpers/Matchers"

describe("PragmaQuotes tests", () => {
  describe("PragmaQuoteView tests", () => {
    fakeTimers()

    const TEST_ANIMATION_INTERVAL = 300

    it("should incrementally render the quote", async () => {
      const quote = "I am Blob"
      renderPragmaQuote(quote)
      advanceByInterval()
      await expectQuote("I")
      advanceByInterval()
      await expectQuote("I ")
      advanceByInterval()
      await expectQuote("I a")
      advanceByInterval()
      await expectQuote("I am")
      advanceByInterval()
      await expectQuote("I am ")
      advanceByInterval()
      await expectQuote("I am B")
      advanceByInterval()
      await expectQuote("I am Bl")
      advanceByInterval()
      await expectQuote("I am Blo")
      advanceByInterval()
      await expectQuote("I am Blob")
      advanceByInterval()
      await expectQuote("I am Blob")
    })

    it("should cancel the interval once the quote is fully rendered", async () => {
      const quote = "A"
      renderPragmaQuote(quote)
      expect(jest.getTimerCount()).toEqual(1)
      advanceByInterval()
      await waitFor(() => expect(jest.getTimerCount()).toEqual(0))
    })

    const advanceByInterval = () => {
      act(() => jest.advanceTimersByTime(TEST_ANIMATION_INTERVAL))
    }

    const expectQuote = async (quote: string) => {
      await waitFor(() => {
        expect(screen.queryByText(quote)).toBeDisplayed()
      })
    }

    const renderPragmaQuote = (quote: string) => {
      return render(
        <PragmaQuoteView
          quote={() => quote}
          initialDelay={TEST_ANIMATION_INTERVAL}
          animationInterval={TEST_ANIMATION_INTERVAL}
        />
      )
    }
  })

  describe("CreateEventQuoteType tests", () => {
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
})
