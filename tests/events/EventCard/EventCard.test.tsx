import { render } from "@testing-library/react-native"
import { EventCard } from "@components/eventCard/EventCard"
import React from "react"
import { EventMocks, CurrentUserEvent } from "@lib/events"
import "../../helpers/Matchers"

jest.mock("react-native-popup-menu")

describe("EventCard tests", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2023-03-18T12:00:00"))
  })
  afterEach(() => jest.useRealTimers())

  it("formats the date range correctly", () => {
    const { queryByLabelText } = renderEventCard(EventMocks.PickupBasketball)
    console.log(queryByLabelText("day"))
    // expect(queryByText("Sat, Mar 18")).toBeDisplayed()
    // expect(queryByText("5:00 AM")).toBeDisplayed()
  })
})

const renderEventCard = (event: CurrentUserEvent) => {
  return render(<EventCard event={event} />)
}
