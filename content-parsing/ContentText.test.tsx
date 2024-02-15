import { ColorString } from "@lib/utils/Color"
import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { ContentText } from "./ContentText"
import { EventHandle } from "./EventHandle"
import { UserHandle } from "./UserHandle"

describe("ContentText tests", () => {
  beforeEach(() => jest.resetAllMocks())

  afterEach(async () => {
    // resolve "Warning: An update to ForwardRef inside a test was not wrapped in act(...)."
    await act(async () => {
      await Promise.resolve()
    })
  })

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
    expect(userHandleTappedAction).toHaveBeenCalledWith(
      UserHandle.parse("why_people").handle
    )
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

  it("allows for opening an event based on its handle", () => {
    const handle = "!17|123/#123456/Pickup Basketball"
    renderLinkedText(
      `This is a handle\n${handle}\nthat brings you to an event.`
    )
    tapText("Pickup Basketball")
    expect(eventHandleTappedAction).toHaveBeenCalledWith(
      new EventHandle(123, "Pickup Basketball", ColorString.parse("#123456")!)
    )
  })

  it("does not detect !!handles as an event handle", () => {
    const invalidHandle = "!!17|123/Pickup Basketball"
    renderLinkedText(invalidHandle)
    expectRegularText(invalidHandle)
  })

  it("does not detect invalid event handles", () => {
    const invalidHandle = "!++++test++++"
    renderLinkedText(invalidHandle)
    expectRegularText(invalidHandle)
  })

  test("the character before an event handle must be whitespace for it to be valid", () => {
    const text = "...!17|123/Pickup Basketball"
    renderLinkedText(text)
    expectRegularText(text)
  })

  const userHandleTappedAction = jest.fn()
  const eventHandleTappedAction = jest.fn()
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
        onUserHandleTapped={userHandleTappedAction}
        onEventHandleTapped={eventHandleTappedAction}
        onURLTapped={urlTappedAction}
      />
    )
  }
})
