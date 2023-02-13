import { Post } from "../src/models"
import { Event } from "@lib/events/Event"
import { fireEvent, render, screen } from "@testing-library/react-native"
import EventItem from "@components/EventItem"
import React from "react"
import { StepIndex } from "aws-sdk/clients/databrew"

const mockedNavigate = jest.fn()

const mockGenerateColor: jest.MockedFunction<() => string> = jest
  .fn()
  .mockImplementation(() => {
    return "blue"
  })

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockedNavigate
  })
}))

const createEvent = (
  title: string,
  hasInvitations: boolean,
  startTime?: Date,
  maxOccupancy?: number
) => {
  return {
    id: "078ff5c0-5bce-4603-b1f3-79cf8258ec29",
    userId: "078ff5c0-5bce-4603-b1f3-79cf8258ec26",
    title,
    repliesCount: 4,
    writtenByYou: true,
    startTime,
    maxOccupancy,
    hasInvitations,
    color: "magenta",
    distance: 0.5
  }
}

describe("PostUI Component Tests", () => {
  const event: Event = createEvent("Title of Event", true, new Date(), 1)

  it("Renders with all options", () => {
    render(<EventItem event={event} />)

    expect(screen.getByLabelText("time until")).toBeDefined()
    expect(screen.getByLabelText("max occupancy")).toBeDefined()
    expect(screen.getByLabelText("request invitations")).toBeDefined()
  })

  it("Renders with only time until event starts", () => {
    const onlyTime: Event = createEvent("Title of Event", false, new Date())
    render(<EventItem event={onlyTime} />)

    expect(screen.queryByLabelText("time until")).toBeDefined()
    expect(screen.queryByLabelText("max occupancy")).toBeNull()
    expect(screen.queryByLabelText("request invitations")).toBeNull()
  })

  it("Renders with only max occupancy", () => {
    const onlyOccupancy: Event = createEvent(
      "Title of Event",
      false,
      undefined,
      1
    )
    render(<EventItem event={onlyOccupancy} />)

    expect(screen.queryByLabelText("time until")).toBeNull()
    expect(screen.queryByLabelText("max occupancy")).toBeDefined()
    expect(screen.queryByLabelText("request invitations")).toBeNull()
  })

  it("Renders with only invitations", () => {
    const onlyInvitations: Event = createEvent("Title of Event", true)
    render(<EventItem event={onlyInvitations} />)

    expect(screen.queryByLabelText("time until")).toBeNull()
    expect(screen.queryByLabelText("max occupancy")).toBeNull()
    expect(screen.queryByLabelText("request invitations")).toBeDefined()
  })

  it("Title is shortened", () => {
    const longTitle: Event = createEvent(
      "Very Long Title of Event That Won't Be Displayed",
      true
    )
    render(<EventItem event={longTitle} />)

    expect(screen.queryByText("Displayed")).toBeNull()
  })

  it("Color of invitation changes on click", () => {
    render(<EventItem event={event} />)
    const invitation = screen.getByLabelText("invitation icon")

    expect(invitation?.props.style[0].color).toEqual("black")
    fireEvent.press(invitation!!)
    expect(invitation?.props.style[0].color).toEqual(event.color)
  })

  it("Time becomes red", () => {
    const time = new Date()
    time.setMinutes(time.getMinutes() + 30)
    const timeChange: Event = createEvent("Title of Event", false, time)
    render(<EventItem event={timeChange} />)

    const timeIcon = screen.queryByLabelText("time icon")
    expect(timeIcon?.props.style.color).toEqual("red")
  })

  it("Occupancy becomes red", () => {
    render(<EventItem event={event} />)

    const timeIcon = screen.queryByLabelText("occupancy icon")
    expect(timeIcon?.props.style.color).toEqual("red")
  })
})
