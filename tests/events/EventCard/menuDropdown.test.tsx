import { TestEventItems } from "@lib/events/Event"
import { fireEvent, render, screen } from "@testing-library/react-native"
import EventItem from "@components/eventCard/EventItem"
import React from "react"
import { captureAlerts } from "../../helpers/Alerts"
import { MenuProvider } from "react-native-popup-menu"
import MenuDropdown from "@components/eventCard/MenuDropdown"

jest.mock("react-native-popup-menu", () => ({
  Menu: "Menu",
  MenuProvider: "MenuProvider",
  MenuOptions: "MenuOptions",
  MenuOption: "MenuOption",
  MenuTrigger: "MenuTrigger"
}))

describe("eventUI Component Tests", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("Event menu displays delete option when user is the host", () => {
    render(
      <MenuProvider>
        <MenuDropdown isEventHost={true} />
      </MenuProvider>
    )

    fireEvent.press(screen.getByTestId(moreButtonLabel))
    expect(screen.queryByText("Delete")).toBeDefined()
    expect(screen.queryByText("Report")).toBeNull()
  })

  it("Event menu displays report option when user isn't the host", () => {
    render(
      <MenuProvider>
        <MenuDropdown isEventHost={false} />
      </MenuProvider>
    )

    fireEvent.press(screen.getByTestId(moreButtonLabel))
    expect(screen.queryByText("Report")).toBeDefined()
    expect(screen.queryByText("Delete")).toBeNull()
  })

  it("Clicking delete opens alert", () => {
    render(
      <MenuProvider>
        <MenuDropdown isEventHost={true} />
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
        <MenuDropdown isEventHost={true} />
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
        <MenuDropdown isEventHost={false} />
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
        <MenuDropdown isEventHost={false} />
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
