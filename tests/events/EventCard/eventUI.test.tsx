import { TestEventItems } from "@lib/events/Event"
import { fireEvent, render, screen } from "@testing-library/react-native"
import EventItem from "@components/EventItem"
import React from "react"
import { captureAlerts } from "../../helpers/Alerts"
import { MenuProvider } from "react-native-popup-menu"

jest.mock("react-native-popup-menu", () => ({
  Menu: "Menu",
  MenuProvider: "MenuProvider",
  MenuOptions: "MenuOptions",
  MenuOption: "MenuOption",
  MenuTrigger: "MenuTrigger"
}))

describe("eventUI Component Tests", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2023-02-26T12:00:00"))
    jest.resetAllMocks()
  })
  afterEach(() => jest.useRealTimers())

  it("Displays time in same format as dateRange", () => {
    render(
      <EventItem
        event={TestEventItems.mockEvent(
          new Date("2023-02-26T17:00:00"),
          new Date("2023-02-26T19:00:00"),
          false
        )}
      />
    )
    expect(screen.getByText("Today 5pm - 7pm")).toBeDefined()
  })

  it("Event menu displays delete option when user is the host", () => {
    render(
      <MenuProvider>
        <EventItem
          event={TestEventItems.mockEvent(
            new Date("2023-02-26T17:00:00"),
            new Date("2023-02-26T19:00:00"),
            true
          )}
        />
      </MenuProvider>
    )

    fireEvent.press(screen.getByTestId(moreButtonLabel))
    expect(screen.queryByText("Delete")).toBeDefined()
    expect(screen.queryByText("Report")).toBeNull()
  })

  it("Event menu displays report option when user isn't the host", () => {
    render(
      <MenuProvider>
        <EventItem
          event={TestEventItems.mockEvent(
            new Date("2023-02-26T17:00:00"),
            new Date("2023-02-26T19:00:00"),
            false
          )}
        />
      </MenuProvider>
    )

    fireEvent.press(screen.getByTestId(moreButtonLabel))
    expect(screen.queryByText("Report")).toBeDefined()
    expect(screen.queryByText("Delete")).toBeNull()
  })

  it("Clicking delete opens alert", () => {
    render(
      <MenuProvider>
        <EventItem
          event={TestEventItems.mockEvent(
            new Date("2023-02-26T17:00:00"),
            new Date("2023-02-26T19:00:00"),
            true
          )}
        />
      </MenuProvider>
    )
    fireEvent.press(screen.getByTestId(moreButtonLabel))
    fireEvent.press(screen.getByText("Delete"))

    expect(alertPresentationSpy).toHaveBeenCalled()
  })

  //* * Right now event isn't removed */
  it("Clicking delete on alert closes alert and removes event", () => {
    render(
      <MenuProvider>
        <EventItem
          event={TestEventItems.mockEvent(
            new Date("2023-02-26T17:00:00"),
            new Date("2023-02-26T19:00:00"),
            true
          )}
        />
      </MenuProvider>
    )
    fireEvent.press(screen.getByTestId(moreButtonLabel))
    fireEvent.press(screen.getByText("Delete"))

    dismissConfirmDelete()
    expect(screen.queryByText("Delete this event?")).toBeNull()
  })

  it("Clicking report opens alert", () => {
    render(
      <MenuProvider>
        <EventItem
          event={TestEventItems.mockEvent(
            new Date("2023-02-26T17:00:00"),
            new Date("2023-02-26T19:00:00"),
            false
          )}
        />
      </MenuProvider>
    )
    fireEvent.press(screen.getByTestId(moreButtonLabel))
    fireEvent.press(screen.getByText("Report"))

    expect(alertPresentationSpy).toHaveBeenCalled()
  })

  //* * Right now reporting isn't implemented */
  it("Clicking report on alert closes alert and reports", () => {
    render(
      <MenuProvider>
        <EventItem
          event={TestEventItems.mockEvent(
            new Date("2023-02-26T17:00:00"),
            new Date("2023-02-26T19:00:00"),
            false
          )}
        />
      </MenuProvider>
    )
    fireEvent.press(screen.getByTestId(moreButtonLabel))
    fireEvent.press(screen.getByText("Report"))

    dismissConfirmReport()
    expect(screen.queryByText("Report this event?")).toBeNull()
  })
})

// Labels
const moreButtonLabel = "more options"

// Alert helpers
const { alertPresentationSpy, tapAlertButton } = captureAlerts()

const dismissConfirmDelete = () => {
  tapAlertButton("Delete")
}

const dismissConfirmReport = () => {
  tapAlertButton("Report")
}
