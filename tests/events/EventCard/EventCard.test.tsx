import { render } from "@testing-library/react-native"
import { EventCard } from "@components/eventCard/EventCard"
import React from "react"
import { EventMocks, Event } from "@lib/events"
import "../../helpers/Matchers"

jest.mock("react-native-popup-menu")

describe("EventCard tests", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2023-03-18T12:00:00"))
  })
  afterEach(() => jest.useRealTimers())

  it("formats the date range correctly", () => {
    const { queryByText } = renderEventCard(EventMocks.PickupBasketball)
    expect(queryByText("Today 12pm - 1pm")).toBeDisplayed()
  })
})

const renderEventCard = (event: Event) => {
  return render(<EventCard event={event} />)
}
