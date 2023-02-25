import { TestEventItems } from "@lib/events/Event"
import { fireEvent, render, screen } from "@testing-library/react-native"
import EventItem from "@components/EventItem"
import React from "react"

describe("PostUI Component Tests", () => {
  const time = new Date()

  it("Renders with all options", () => {
    render(<EventItem event={TestEventItems.mockEvent(time, 5, true, true)} />)
    expect(screen.queryByLabelText(timeComponentLabel)).toBeDefined()
    expect(screen.queryByLabelText(occupancyComponentLabel)).toBeDefined()
    expect(screen.queryByLabelText(invitationComponentLabel)).toBeDefined()
  })

  it("Renders with only time until event starts", () => {
    render(
      <EventItem
        event={TestEventItems.mockEvent(time, undefined, false, true)}
      />
    )
    expect(screen.queryByLabelText(timeComponentLabel)).toBeDefined()
    expect(screen.queryByLabelText(occupancyComponentLabel)).toBeNull()
    expect(screen.queryByLabelText(invitationComponentLabel)).toBeNull()
  })

  it("Renders with only max occupancy", () => {
    render(
      <EventItem event={TestEventItems.mockEvent(undefined, 5, false, false)} />
    )
    expect(screen.queryByLabelText(timeComponentLabel)).toBeNull()
    expect(screen.queryByLabelText(occupancyComponentLabel)).toBeDefined()
    expect(screen.queryByLabelText(invitationComponentLabel)).toBeNull()
  })

  it("Renders with only invitations", () => {
    render(
      <EventItem
        event={TestEventItems.mockEvent(undefined, undefined, true, false)}
      />
    )
    expect(screen.queryByLabelText(timeComponentLabel)).toBeNull()
    expect(screen.queryByLabelText(occupancyComponentLabel)).toBeNull()
    expect(screen.queryByLabelText(invitationComponentLabel)).toBeDefined()
  })

  it("Color of invitation changes on click", () => {
    const event = TestEventItems.mockEvent(time, 5, true, true)
    const { debug } = render(<EventItem event={event} />)
    console.log(debug())

    const invitation = screen.queryByLabelText(invitationIconLabel)
    expect(invitation?.props.style[0].color).toEqual("black")
    fireEvent.press(invitation!!)
    expect(invitation?.props.style[0].color).toEqual(event.colorHex)
  })

  it("Time becomes red", () => {
    render(<EventItem event={TestEventItems.mockEvent(time, 5, true, false)} />)

    const timeIcon = screen.queryByLabelText(timeIconLabel)
    expect(timeIcon?.props.style.color).toEqual("red")
  })

  it("Occupancy becomes red", () => {
    render(<EventItem event={TestEventItems.mockEvent(time, 1, true, true)} />)

    const occupancyIcon = screen.queryByLabelText(occupancyIconLabel)
    expect(occupancyIcon?.props.style.color).toEqual("red")
  })
})

// Labels
const timeComponentLabel = "time until"
const occupancyComponentLabel = "max occupancy"
const invitationComponentLabel = "request invitations"
const invitationIconLabel = "invitation icon"
const timeIconLabel = "time icon"
const occupancyIconLabel = "occupancy icon"
