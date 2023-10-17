import { fireEvent, render, screen } from "@testing-library/react-native"
import React from "react"
import { captureAlerts } from "../tests/helpers/Alerts"
import { MenuProvider } from "react-native-popup-menu"
import MenuDropdown from "@event-details/MenuDropdown"

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

    openDropdown()
    expect(screen.queryByText("Delete")).toBeDefined()
    expect(screen.queryByText("Report")).toBeNull()
  })

  it("Event menu displays report option when user isn't the host", () => {
    render(
      <MenuProvider>
        <MenuDropdown isEventHost={false} />
      </MenuProvider>
    )

    openDropdown()
    expect(screen.queryByText("Report")).toBeDefined()
    expect(screen.queryByText("Delete")).toBeNull()
  })

  it("Clicking delete opens alert", () => {
    render(
      <MenuProvider>
        <MenuDropdown isEventHost={true} />
      </MenuProvider>
    )
    openDropdown()
    selectDelete()

    expect(alertPresentationSpy).toHaveBeenCalled()
  })

  //* * Right now event isn't removed */
  it("Clicking delete on alert closes alert and removes event", async () => {
    render(
      <MenuProvider>
        <MenuDropdown isEventHost={true} />
      </MenuProvider>
    )
    openDropdown()
    selectDelete()
    await dismissConfirmDelete()

    expect(screen.queryByText("Delete this event?")).toBeNull()
  })

  it("Clicking report opens alert", () => {
    render(
      <MenuProvider>
        <MenuDropdown isEventHost={false} />
      </MenuProvider>
    )
    openDropdown()
    selectReport()

    expect(alertPresentationSpy).toHaveBeenCalled()
  })

  //* * Right now reporting isn't implemented */
  it("Clicking report on alert closes alert and reports", async () => {
    render(
      <MenuProvider>
        <MenuDropdown isEventHost={false} />
      </MenuProvider>
    )
    openDropdown()
    selectReport()
    await dismissConfirmReport()

    expect(screen.queryByText("Report this event?")).toBeNull()
  })
})

// Labels
const moreButtonLabel = "more options"

// Alert helpers
const { alertPresentationSpy, tapAlertButton } = captureAlerts()

const dismissConfirmDelete = async () => {
  await tapAlertButton("Delete")
}

const dismissConfirmReport = async () => {
  await tapAlertButton("Report")
}

const openDropdown = () => {
  fireEvent.press(screen.getByTestId(moreButtonLabel))
}

const selectDelete = () => {
  fireEvent.press(screen.getByText("Delete"))
}

const selectReport = () => {
  fireEvent.press(screen.getByText("Report"))
}
