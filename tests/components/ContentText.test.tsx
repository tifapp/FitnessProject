import { ContentText } from "@components/ContentText"
import { fireEvent, render, screen } from "@testing-library/react-native"

describe("ContentText tests", () => {
  beforeEach(() => jest.resetAllMocks())

  it("renders text without urls or profile handles normally", () => {
    const text = "Hello world this is a test"
    renderLinkedText(text)
    expectRegularText(text)
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

  it("allows for opening a profile based on its handle", () => {
    const handle = "@why_people"
    renderLinkedText(
      `This is a handle\n${handle}\nthat brings you to a profile.`
    )
    tapText(handle)
    expect(handleTappedAction).toHaveBeenCalledWith(handle)
  })

  it("does not detect @@handles as a handle", () => {
    const invalidHandle = "@@why_people"
    renderLinkedText(invalidHandle)
    expectRegularText(invalidHandle)
  })

  it("does not detect invalid handles", () => {
    const invalidHandle = "@++++test++++"
    renderLinkedText(invalidHandle)
    expectRegularText(invalidHandle)
  })

  test("the character before a handle must be whitespace for it to be valid", () => {
    const text = "...@why_people"
    renderLinkedText(text)
    expectRegularText(text)
  })

  const handleTappedAction = jest.fn()
  const urlTappedAction = jest.fn()

  const tapText = (text: string) => {
    fireEvent.press(screen.getByText(text))
  }

  const expectRegularText = (text: string) => {
    expect(screen.getByText(text).props.testID).toEqual("regular-text")
  }

  const renderLinkedText = (url: string) => {
    return render(
      <ContentText
        text={url}
        onUserHandleTapped={handleTappedAction}
        onURLTapped={urlTappedAction}
      />
    )
  }
})
