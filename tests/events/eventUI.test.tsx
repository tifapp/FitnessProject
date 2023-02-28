import { TestEventItems } from "@lib/events/Event"
import { render, screen } from "@testing-library/react-native"
import { format } from "date-fns"
import EventItem from "@components/EventItem"
import React from "react"

let startDate: Date
let endDate: Date

describe("eventUI Component Tests", () => {
  beforeAll(() => {
    startDate = new Date()
    endDate = new Date()
  })
  it("Renders", () => {
    render(<EventItem event={TestEventItems.mockEvent(startDate, endDate)} />)

    expect(screen.queryByLabelText(profileLabel)).toBeDefined()
    expect(screen.getByText("Nicolette Antisdel")).toBeDefined()
    expect(screen.getByText("Pickup Basketball")).toBeDefined()
    expect(screen.getByText("1156 High St, Santa Cruz, CA 95064")).toBeDefined()
  })

  it("Displays today when Event is same day", () => {
    render(<EventItem event={TestEventItems.mockEvent(startDate, endDate)} />)
    expect(screen.getByText("Today,")).toBeDefined()
  })

  it("Displays Tomorrow when Event is tomorrow", () => {
    startDate.setDate(startDate.getDate() + 1)
    render(<EventItem event={TestEventItems.mockEvent(startDate, endDate)} />)
    expect(screen.getByText("Tomorrow,")).toBeDefined()
  })

  it("Displays day of week when Event < 7 Days away", () => {
    startDate.setDate(startDate.getDate() + 3)
    render(<EventItem event={TestEventItems.mockEvent(startDate, endDate)} />)
    expect(screen.getByText(format(startDate, "EEEE,"))).toBeDefined()
  })

  it("Displays month, day when Event > 7 days away", () => {
    startDate.setDate(startDate.getDate() + 9)
    render(<EventItem event={TestEventItems.mockEvent(startDate, endDate)} />)
    expect(screen.getByText(format(startDate, "LLL io,"))).toBeDefined()
  })
})

// Labels
const profileLabel = "profile picture"
