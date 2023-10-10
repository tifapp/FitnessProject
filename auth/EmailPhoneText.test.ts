import { renderHook } from "@testing-library/react-native"
import { EmailPhoneTextType, useEmailPhoneTextState } from "./EmailPhoneText"
import { act } from "react-test-renderer"
import { USPhoneNumber } from "./PhoneNumber"
import { EmailAddress } from "./Email"

describe("useEmailPhoneTextState tests", () => {
  it("should be able seemlessly switch between changing both email and phone number text", () => {
    const { result } = renderUseEmailPhoneTextState("phone")

    act(() => result.current.onTextChanged("1234567890"))
    expect(result.current.text).toEqual("(123) 456-7890")
    expect(result.current.parsedValue).toBeInstanceOf(USPhoneNumber)

    act(() => result.current.onActiveTextTypeChanged("email"))

    act(() => result.current.onTextChanged("john@gmail.com"))
    expect(result.current.text).toEqual("john@gmail.com")
    expect(result.current.parsedValue).toBeInstanceOf(EmailAddress)

    act(() => result.current.onActiveTextTypeToggled())
    expect(result.current.text).toEqual("(123) 456-7890")
    expect(result.current.parsedValue).toBeInstanceOf(USPhoneNumber)

    act(() => result.current.onActiveTextTypeToggled())
    expect(result.current.text).toEqual("john@gmail.com")
    expect(result.current.parsedValue).toBeInstanceOf(EmailAddress)
  })

  it("should properly format phone numbers in weird formats", () => {
    const { result } = renderUseEmailPhoneTextState("phone")

    act(() => result.current.onTextChanged("1234"))
    expect(result.current.text).toEqual("(123) 4")

    act(() => result.current.onTextChanged("(123) 4567"))
    expect(result.current.text).toEqual("(123) 456-7")

    act(() => result.current.onTextChanged("(123) 456-"))
    expect(result.current.text).toEqual("(123) 456")

    act(() => result.current.onTextChanged("(123) "))
    expect(result.current.text).toEqual("123")
  })

  const renderUseEmailPhoneTextState = (textType: EmailPhoneTextType) => {
    return renderHook(() => useEmailPhoneTextState(textType))
  }
})
