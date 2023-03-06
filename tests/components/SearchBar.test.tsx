import { fireEvent, render, screen } from "@testing-library/react-native"
import React, { useState } from "react"
import { View } from "react-native"
import SearchBar from "@components/SearchBar"
import "../helpers/Matchers"

describe("SearchBar tests", () => {
  beforeEach(() => jest.resetAllMocks())

  it("allows a user action when icon tapped", () => {
    renderSearchBar()
    tapIcon()
    expect(userAction).toHaveBeenCalled()
  })

  test("basic searching", () => {
    renderSearchBar()
    enterText("Hello world")
    expect(searchedText("Hello world")).toBeDisplayed()
  })
})

const renderSearchBar = () => {
  render(<Test />)
}

const userAction = jest.fn()
const testLabel = "Test"
const testPlaceholderText = "Search Test"

const Test = () => {
  const [text, setText] = useState("")
  return (
    <View testID={text}>
      <SearchBar
        onIconTapped={userAction}
        icon="10k"
        placeholder={testPlaceholderText}
        iconAccessibilityLabel={testLabel}
        text={text}
        onTextChanged={setText}
      />
    </View>
  )
}

const tapIcon = () => {
  fireEvent.press(screen.getByLabelText(testLabel))
}

const searchedText = (text: string) => {
  return screen.queryByTestId(text)
}

const enterText = (text: string) => {
  fireEvent.changeText(screen.getByPlaceholderText(testPlaceholderText), text)
}
