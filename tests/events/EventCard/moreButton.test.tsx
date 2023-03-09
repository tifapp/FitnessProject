import MoreButton from "@components/eventItem/MoreButton"
import {
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native"
import React from "react"
import { MenuProvider } from "react-native-popup-menu"
import { captureAlerts } from "../../helpers/Alerts"

jest.mock("react-native-popup-menu", () => ({
  Menu: "Menu",
  MenuProvider: "MenuProvider",
  MenuOptions: "MenuOptions",
  MenuOption: "MenuOption",
  MenuTrigger: "MenuTrigger"
}))

describe("More button Tests", () => {
  beforeEach(() => jest.resetAllMocks())

  it("Event menu displays delete option when user is the host", () => {
    render(
      <MenuProvider>
        <MoreButton eventHost={true} />
      </MenuProvider>
    )

    fireEvent.press(screen.getByTestId(moreButtonLabel))
    expect(screen.queryByText("Delete")).toBeDefined()
    expect(screen.queryByText("Report")).toBeNull()
  })

  it("Event menu displays report option when user isn't the host", () => {
    render(
      <MenuProvider>
        <MoreButton eventHost={false} />
      </MenuProvider>
    )

    fireEvent.press(screen.getByTestId(moreButtonLabel))
    expect(screen.queryByText("Report")).toBeDefined()
    expect(screen.queryByText("Delete")).toBeNull()
  })

  it("Clicking delete opens alert", async () => {
    render(
      <MenuProvider>
        <MoreButton eventHost={true} />
      </MenuProvider>
    )
    fireEvent.press(screen.getByTestId(moreButtonLabel))
    fireEvent.press(screen.getByText("Delete"))

    await waitFor(() => expect(alertPresentationSpy).toHaveBeenCalled())
  })

  //* * Right now event isn't removed */
  it("Clicking delete on alert closes alert and removes event", async () => {
    render(
      <MenuProvider>
        <MoreButton eventHost={true} />
      </MenuProvider>
    )
    fireEvent.press(screen.getByTestId(moreButtonLabel))
    fireEvent.press(screen.getByText("Delete"))

    await dismissConfirmDelete()
    expect(screen.queryByText("Delete this event?")).toBeNull()
  })

  it("Clicking report opens alert", async () => {
    render(
      <MenuProvider>
        <MoreButton eventHost={false} />
      </MenuProvider>
    )
    fireEvent.press(screen.getByTestId(moreButtonLabel))
    fireEvent.press(screen.getByText("Report"))

    await waitFor(() => expect(alertPresentationSpy).toHaveBeenCalled())
  })

  //* * Right now reporting isn't implemented */
  it("Clicking report on alert closes alert and reports", async () => {
    render(
      <MenuProvider>
        <MoreButton eventHost={false} />
      </MenuProvider>
    )
    fireEvent.press(screen.getByTestId(moreButtonLabel))
    fireEvent.press(screen.getByText("Report"))

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
