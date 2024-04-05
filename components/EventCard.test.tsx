import { render } from "@testing-library/react-native"
import { EventCard } from "./EventCard"
import React from "react"
import { CurrentUserEvent } from "@shared-models/Event"
import "@test-helpers/Matchers"
import { EventMocks } from "@event-details-boundary/MockData"

describe("EventCard tests", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2023-03-07T12:00:00"))
  })
  afterEach(() => jest.useRealTimers())

  it("formats the date range correctly", () => {
    const { queryByText } = renderEventCard(EventMocks.PickupBasketball)
    expect(queryByText("Sat, Mar 18 • 12:00 PM")).toBeDisplayed()
  })
})

const renderEventCard = (event: CurrentUserEvent) => {
  return render(<EventCard event={event} />)
}
