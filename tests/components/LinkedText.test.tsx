import { LinkedText } from "@components/LinkedText"
import { fireEvent, render, screen } from "@testing-library/react-native"

describe("LinkedText tests", () => {
  beforeEach(() => jest.resetAllMocks())

  it("renders text without urls or profile handles normally", () => {
    const text = "Hello world this is a test"
    renderLinkedText(text)
    expectRegularText(text)
  })

  it("renders text and urls together", () => {
    const text = "Hello world https://www.youareanidiot.cc this is a test"
    renderLinkedText(text)
    expectLinkText("https://www.youareanidiot.cc")
  })

  it("allows for opening raw urls embedded in text", () => {
    const url = "google.com"
    renderLinkedText(`Hello world this is a url to: ${url}!`)
    tapText(url)
    expect(urlTappedAction).toHaveBeenCalledWith("http://google.com")
  })

  it("allows for opening raw emails embedded in text", () => {
    const email = "bigchungus@gmail.com"
    renderLinkedText(`Hello world this is an email to: ${email}!`)
    tapText(email)
    expect(urlTappedAction).toHaveBeenCalledWith("mailto:bigchungus@gmail.com")
  })

  const urlTappedAction = jest.fn()

  const tapText = (text: string) => {
    fireEvent.press(screen.getByText(text))
  }

  const expectRegularText = (text: string) => {
    expect(screen.getByText(text).props.testID).toEqual("regular-text")
  }

  const expectLinkText = (text: string) => {
    expect(screen.getByText(text).props.style[0].textDecorationLine).toEqual(
      "underline"
    )
  }

  const renderLinkedText = (url: string) => {
    return render(<LinkedText text={url} onURLTapped={urlTappedAction} />)
  }
})
