import MoreButton from "@components/eventItem/MoreButton"
import { fireEvent, render, screen } from "@testing-library/react-native"
import React from "react"
import { MenuProvider } from "react-native-popup-menu"

jest.mock("react-native-popup-menu", () => ({
  Menu: "Menu",
  MenuProvider: "MenuProvider",
  MenuOptions: "MenuOptions",
  MenuOption: "MenuOption",
  MenuTrigger: "MenuTrigger"
}))

describe("More button Tests", () => {
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
})

// Labels
const moreButtonLabel = "more options"
