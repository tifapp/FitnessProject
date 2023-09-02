import { useEffect, useState } from "react"
import { Keyboard, Platform } from "react-native"

/**
 * A hook that tracks the state of the keyboard.
 */
export const useKeyboardState = () => {
  const [isPresented, setIsPresented] = useState(false)

  useEffect(() => {
    const showEventName =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow"
    const showSubscription = Keyboard.addListener(showEventName, () => {
      setIsPresented(true)
    })

    const hideEventName =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide"
    const hideSubscription = Keyboard.addListener(hideEventName, () => {
      setIsPresented(false)
    })
    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

  return { isPresented }
}
