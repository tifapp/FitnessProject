import { renderHook } from "@testing-library/react-native"
import {
  EmailPhoneTextType,
  useEmailPhoneTextState
} from "./UseEmailPhoneTextState"
import { act } from "react-test-renderer"
import { USPhoneNumber } from "./PhoneNumber"
import { EmailAddress } from "./Email"

describe("useEmailPhoneTextState tests", () => {
  it("should be able seemlessly switch between changing both email and phone number text", () => {
    const { result } = renderUseEmailPhoneTextState("phone")

    act(() => result.current.onTextChanged("1234567890"))
    expect(result.current.text).toEqual("1234567890")
    expect(result.current.parsedValue).toBeInstanceOf(USPhoneNumber)

    act(() => result.current.switchActiveTextTypeTo("email"))

    act(() => result.current.onTextChanged("john@gmail.com"))
    expect(result.current.text).toEqual("john@gmail.com")
    expect(result.current.parsedValue).toBeInstanceOf(EmailAddress)

    act(() => result.current.switchActiveTextTypeTo("phone"))
    expect(result.current.text).toEqual("1234567890")
    expect(result.current.parsedValue).toBeInstanceOf(USPhoneNumber)

    act(() => result.current.switchActiveTextTypeTo("email"))
    expect(result.current.text).toEqual("john@gmail.com")
    expect(result.current.parsedValue).toBeInstanceOf(EmailAddress)
  })

  const renderUseEmailPhoneTextState = (textType: EmailPhoneTextType) => {
    return renderHook(() => useEmailPhoneTextState(textType))
  }
})
