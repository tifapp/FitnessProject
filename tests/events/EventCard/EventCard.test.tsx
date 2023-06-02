import { render } from "@testing-library/react-native"
import { EventCard } from "@components/eventCard/EventCard"
import React from "react"
import { EventMocks, CurrentUserEvent } from "@lib/events"
import "../../helpers/Matchers"

describe("EventCard tests", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2023-03-07T12:00:00"))
  })
  afterEach(() => jest.useRealTimers())

  it("formats the date range correctly", () => {
    const { queryByText } = renderEventCard(EventMocks.PickupBasketball)
    expect(queryByText("Sat, Mar 18")).toBeDisplayed()
  })
})

const renderEventCard = (event: CurrentUserEvent) => {
  return render(<EventCard event={event} />)
}
