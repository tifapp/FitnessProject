import { SearchBar } from "@components/SearchBar"
import "@test-helpers/Matchers"
import { act, fireEvent, render, screen } from "@testing-library/react-native"
import React, { useState } from "react"
import { View } from "react-native"

describe("SearchBar tests", () => {
  beforeEach(() => jest.resetAllMocks())

  afterEach(async () => {
    // resolve "Warning: An update to ForwardRef inside a test was not wrapped in act(...)."
    await act(async () => {
      await Promise.resolve()
    })
  })

  test("basic searching", () => {
    renderSearchBar()
    enterText("Hello world")
    expect(searchedText("Hello world")).toBeDisplayed()
  })

  it("should be able to clear search text when characters entered", () => {
    renderSearchBar()
    enterText("Hello world")
    clearText()
    expect(searchedText("")).toBeDisplayed()
  })

  it("should not be able to clear search text when no characters entered", () => {
    renderSearchBar()
    expect(canClearText()).toEqual(false)
  })
})

const renderSearchBar = () => {
  render(<SearchBarTest />)
}

const testPlaceholderText = "Search Test"

const SearchBarTest = () => {
  const [text, setText] = useState("")
  return (
    <View testID={text}>
      <SearchBar
        placeholder={testPlaceholderText}
        text={text}
        onTextChanged={setText}
      />
    </View>
  )
}

const canClearText = () => {
  return clearButton() !== null
}

const clearText = () => {
  fireEvent.press(clearButton()!!)
}

const clearButton = () => screen.queryByLabelText("Clear all search text")

const searchedText = (text: string) => {
  return screen.queryByTestId(text)
}

const enterText = (text: string) => {
  fireEvent.changeText(screen.getByPlaceholderText(testPlaceholderText), text)
}
