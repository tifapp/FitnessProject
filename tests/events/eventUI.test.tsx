import { TestEventItems } from "@lib/events/Event"
import { render, screen } from "@testing-library/react-native"
import EventItem from "@components/EventItem"
import React from "react"

describe("eventUI Component Tests", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2023-02-26T12:00:00"))
  })
  afterEach(() => jest.useRealTimers())

  it("Displays time in same format as dateRange", () => {
    render(
      <EventItem
        event={TestEventItems.mockEvent(
          new Date("2023-02-26T17:00:00"),
          new Date("2023-02-26T19:00:00")
        )}
      />
    )
    const date = screen.getByLabelText("day")
    console.log(date)
    expect(screen.getByText("Today 5pm - 7pm")).toBeDefined()
  })
})
